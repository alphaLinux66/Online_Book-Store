import os
import sys
import django
import json
import time

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS = list(settings.ALLOWED_HOSTS) + ['testserver']

from django.test import Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from api.models import (
    Book, CartItem, StoreOwnerProfile, SupplierBook, BulkOrder, WriterProfile, Order, ChatInteraction
)

# Color Formatting Console Helpers
def print_header(title):
    print("\n" + "=" * 80)
    print(f"** SYSTEM TESTING RUNNER: {title} **")
    print("=" * 80)

def print_pass(test_id, scenario, detail=""):
    print(f"[PASS] {test_id:<12} | {scenario:<60}")
    if detail:
        print(f"      Details: {detail}")

def print_fail(test_id, scenario, detail=""):
    print(f"[FAIL] {test_id:<12} | {scenario:<60}")
    if detail:
        print(f"      Reason:  {detail}")

def print_step(msg):
    print(f"  -> [STEP] {msg}")

def print_db_state(msg):
    print(f"  DB >> [DATABASE] {msg}")


def run_validation_test_suite():
    client = Client()
    report_data = []

    print_header("INITIALIZING DATABASE & CLEANING PREVIOUS DATA")
    
    # 0. Clean Up Previous Test Runs (Idempotency)
    test_usernames = ['test_writer', 'test_customer', 'test_supplier', 'test_admin']
    deleted_users = User.objects.filter(username__in=test_usernames).delete()
    print_db_state(f"Cleaned up {deleted_users[0]} test users cascade-linked profiles.")
    
    deleted_books = Book.objects.filter(title__in=["Clean Code in Python", "Test Manuscript Upload"]).delete()
    print_db_state(f"Cleaned up {deleted_books[0]} matching test book records.")
    
    time.sleep(1) # Visual delay

    # Create Admin User
    admin_user = User.objects.create_superuser('test_admin', 'admin@papyrusplaza.com', 'AdminPassword123!')
    print_db_state("Created superuser 'test_admin' for B2B Bulk Checkout operations.")

    # ==========================================
    # PART 1 & 2: AUTHENTICATION & INTEGRATION
    # ==========================================
    print_header("PART 1 & 2: USER AUTHENTICATION & PRIVILEGE CHECKS")

    # TEST UT-AUTH-01 / ST-AUTH-01: Register Writer
    print_step("Submitting Writer registration payload to /api/auth/register-writer/")
    writer_register_payload = {
        "username": "test_writer",
        "email": "writer@papyrusplaza.com",
        "password": "WriterPassword123!",
        "pen_name": "Stephen King Jr"
    }
    response = client.post('/api/auth/register-writer/', data=writer_register_payload)
    
    t_id = "UT-AUTH-01"
    scenario = "Register Writer Profile & Check Profile Model Instance"
    if response.status_code == 201:
        writer_obj = User.objects.get(username="test_writer")
        profile_created = hasattr(writer_obj, 'writer_profile')
        if profile_created:
            print_pass(t_id, scenario, "Writer Profile successfully assigned to User model.")
            report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Pass", "detail": "HTTP 201. Profile created in database."})
        else:
            print_fail(t_id, scenario, "User created but profile assignment failed.")
            report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Fail", "detail": "Profile missing."})
    else:
        print_fail(t_id, scenario, f"Expected 201, got {response.status_code}. Content: {response.content}")
        report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Fail", "detail": str(response.content)})

    # Register Customer
    print_step("Submitting Customer registration payload to /api/auth/register/")
    customer_register_payload = {
        "username": "test_customer",
        "email": "customer@papyrusplaza.com",
        "password": "CustomerPassword123!"
    }
    client.post('/api/auth/register/', data=customer_register_payload)

    # TEST UT-AUTH-02: JWT Authentication Token Retrieval (Writer)
    print_step("Submitting login credentials for test_writer to /api/auth/login/")
    login_payload = {
        "username": "test_writer",
        "password": "WriterPassword123!"
    }
    response = client.post('/api/auth/login/', data=login_payload)
    
    t_id = "UT-AUTH-02"
    scenario = "Verify JWT Tokens Return on Successful Credentials"
    writer_token = ""
    if response.status_code == 200:
        data = response.json()
        if "access" in data and "refresh" in data:
            writer_token = data["access"]
            print_pass(t_id, scenario, "Successfully generated valid Access & Refresh tokens.")
            report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Pass", "detail": "Tokens verified."})
        else:
            print_fail(t_id, scenario, "Payload structure missing 'access' or 'refresh' keys.")
            report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Fail", "detail": "Payload error."})
    else:
        print_fail(t_id, scenario, f"Failed credentials with status {response.status_code}")
        report_data.append({"id": t_id, "type": "Unit", "scenario": scenario, "status": "Fail", "detail": "Credentials rejected."})

    # Obtain JWT Token for test_customer
    print_step("Submitting login credentials for test_customer to /api/auth/login/")
    resp_cust_login = client.post('/api/auth/login/', data={"username": "test_customer", "password": "CustomerPassword123!"})
    customer_token = resp_cust_login.json().get("access", "") if resp_cust_login.status_code == 200 else ""

    # Obtain JWT Token for test_admin
    print_step("Submitting login credentials for test_admin to /api/auth/login/")
    resp_admin_login = client.post('/api/auth/login/', data={"username": "test_admin", "password": "AdminPassword123!"})
    admin_token = resp_admin_login.json().get("access", "") if resp_admin_login.status_code == 200 else ""

    # TEST IT-AUTH-01: Role-Based Authorization Safeguard (Customer attempts Writer Analytics)
    print_step("Simulating Customer accessing Writer Analytics (Privilege Escalation)")
    response = client.get('/api/writer-analytics/', HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    t_id = "IT-AUTH-01"
    scenario = "Access Control: Block Customer from Writer Analytics Dashboard"
    if response.status_code == 403:
        print_pass(t_id, scenario, "Privilege escalation blocked. Received HTTP 403 Forbidden.")
        report_data.append({"id": t_id, "type": "Integration", "scenario": scenario, "status": "Pass", "detail": "HTTP 403 validation check passed."})
    else:
        print_fail(t_id, scenario, f"Expected 403 Forbidden, got {response.status_code}")
        report_data.append({"id": t_id, "type": "Integration", "scenario": scenario, "status": "Fail", "detail": f"Vulnerability: Returned {response.status_code}"})

    # ==========================================
    # PART 3: SYSTEM TESTING (B2B Bulk Flow)
    # ==========================================
    print_header("PART 3: B2B BULK CHECKOUT & STOCK SYNCHRONIZATION")

    # Setup Supplier Profile
    print_step("Registering Supplier user and profile via /api/auth/register-supplier/")
    supplier_payload = {
        "username": "test_supplier",
        "email": "supplier@papyrusplaza.com",
        "password": "SupplierPassword123!",
        "store_name": "Metro Book Distributors"
    }
    response = client.post('/api/auth/register-supplier/', data=supplier_payload)
    supplier_obj = User.objects.get(username="test_supplier")
    supplier_profile = supplier_obj.store_owner_profile
    print_db_state(f"Supplier Profile registered successfully (Store: {supplier_profile.store_name})")

    # Add wholesale inventory
    supplier_book = SupplierBook.objects.create(
        owner=supplier_profile,
        title="Clean Code in Python",
        author="Dusty Phillips",
        wholesale_price=450.00,
        stock_quantity=500,
        description="Write cleaner and cleaner code inside python v3."
    )
    print_db_state(f"Added wholesale inventory item: '{supplier_book.title}' @ Rs. {supplier_book.wholesale_price}")

    # Obtain JWT Token for test_supplier
    resp_supp_login = client.post('/api/auth/login/', data={"username": "test_supplier", "password": "SupplierPassword123!"})
    supplier_token = resp_supp_login.json().get("access", "") if resp_supp_login.status_code == 200 else ""

    # TEST ST-B2B-01: Admin Places B2B Bulk Checkout
    print_step("Admin user executing bulk ordering endpoint /api/bulk-checkout/")
    bulk_checkout_payload = {
        "store_owner_id": supplier_profile.id,
        "items": [
            {
                "id": supplier_book.id,
                "wholesale_price": "450.00",
                "quantity": 100
            }
        ]
    }
    response = client.post('/api/bulk-checkout/', data=bulk_checkout_payload, HTTP_AUTHORIZATION=f'Bearer {admin_token}', content_type='application/json')
    t_id = "ST-B2B-01"
    scenario = "Verify Admin places B2B Bulk Order successfully"
    order_id = None
    if response.status_code == 201:
        order_id = response.json().get("order_id")
        print_pass(t_id, scenario, f"Successfully created Bulk Order #{order_id} in status 'Pending'.")
        report_data.append({"id": t_id, "type": "System", "scenario": scenario, "status": "Pass", "detail": f"Order #{order_id} generated."})
    else:
        print_fail(t_id, scenario, f"Order placement failed with code {response.status_code}. Content: {response.content}")
        report_data.append({"id": t_id, "type": "System", "scenario": scenario, "status": "Fail", "detail": str(response.content)})

    # TEST IT-B2B-02: Supplier marks Bulk Order as 'Delivered' triggering sync
    print_step(f"Supplier logging in to patch order status to 'Delivered' to trigger sync")
    response = client.patch(f'/api/bulk-orders/{order_id}/status/', data={"status": "Delivered"}, HTTP_AUTHORIZATION=f'Bearer {supplier_token}', content_type='application/json')
    
    t_id = "IT-B2B-02"
    scenario = "Inventory Sync: Delivered status populates retail book catalog"
    if response.status_code == 200:
        # Check database to see if book exists in standard retail catalog (Book model)
        retail_book = Book.objects.filter(title="Clean Code in Python").first()
        if retail_book and retail_book.stock == 100:
            print_pass(t_id, scenario, f"Inventory synchronization succeeded! Book '{retail_book.title}' created with stock level 100.")
            report_data.append({"id": t_id, "type": "Integration", "scenario": scenario, "status": "Pass", "detail": "Stock is now 100."})
        else:
            print_fail(t_id, scenario, "Status changed but Book model was not generated or stock mismatch.")
            report_data.append({"id": t_id, "type": "Integration", "scenario": scenario, "status": "Fail", "detail": "Stock sync failure."})
    else:
        print_fail(t_id, scenario, f"Failed updating order status. Got code {response.status_code}")
        report_data.append({"id": t_id, "type": "Integration", "scenario": scenario, "status": "Fail", "detail": str(response.content)})

    # ==========================================
    # PART 4: BOUNDARY VALUE ANALYSIS (BVA)
    # ==========================================
    print_header("PART 4: BOUNDARY VALUE ANALYSIS (BVA)")

    # TEST BVA-B2B-01: Bulk Order minimum discount boundaries (quantity)
    print_step("Testing retail checkout boundary limit conditions (Empty checkout)")
    response = client.post('/api/checkout/', HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    t_id = "BVA-B2B-01"
    scenario = "Checkout Limit Validation: Check system rejects empty cart checkout"
    if response.status_code == 400:
        print_pass(t_id, scenario, "Successfully blocked empty cart. Returned HTTP 400 Bad Request.")
        report_data.append({"id": t_id, "type": "Boundary", "scenario": scenario, "status": "Pass", "detail": "HTTP 400 Empty Cart check passed."})
    else:
        print_fail(t_id, scenario, f"Expected 400, got {response.status_code}")
        report_data.append({"id": t_id, "type": "Boundary", "scenario": scenario, "status": "Fail", "detail": f"Invalid state check. Got code {response.status_code}"})

    # ==========================================
    # PART 5: EQUIVALENCE PARTITIONING (EP)
    # ==========================================
    print_header("PART 5: EQUIVALENCE PARTITIONING (EP)")

    # TEST EP-AUTH-01: Password reset format verification
    print_step("Submitting invalid partition reset password payload (empty fields)")
    response = client.post('/api/auth/reset-password/', data={"username": "test_writer", "new_password": ""})
    t_id = "EP-AUTH-01"
    scenario = "Input Partitioning: Rejection of invalid empty password resets"
    if response.status_code == 400:
        print_pass(t_id, scenario, "Validation logic detected empty field and returned HTTP 400.")
        report_data.append({"id": t_id, "type": "Equivalence", "scenario": scenario, "status": "Pass", "detail": "Rejected invalid empty inputs."})
    else:
        print_fail(t_id, scenario, f"Expected 400, got {response.status_code}")
        report_data.append({"id": t_id, "type": "Equivalence", "scenario": scenario, "status": "Fail", "detail": "Failed to block empty reset fields."})

    # ==========================================
    # PART 6: REGRESSION ANALYSIS
    # ==========================================
    print_header("PART 6: SYSTEM REGRESSION CHECKS")

    # TEST RG-RAG-01: AI Chatbot Query Endpoint Performance Check
    print_step("Executing AI chatbot search queries to verify response stability")
    chatbot_payload = {"query": "Suggest code books"}
    start_time = time.time()
    response = client.post('/api/chatbot/ask/', data=chatbot_payload, content_type='application/json')
    end_time = time.time()
    elapsed_ms = (end_time - start_time) * 1000

    t_id = "RG-RAG-01"
    scenario = "Verify RAG Chatbot responds without server regression and tracks interaction log"
    if response.status_code == 200:
        # Check interaction table to see if it compiled a database log entry
        chat_log = ChatInteraction.objects.filter(user_query="Suggest code books").first()
        if chat_log and elapsed_ms < 5000.0:
            print_pass(t_id, scenario, f"Response completed in {elapsed_ms:.1f}ms. Interaction log registered successfully in database.")
            report_data.append({"id": t_id, "type": "Regression", "scenario": scenario, "status": "Pass", "detail": f"Time: {elapsed_ms:.1f}ms. Log entry saved."})
        else:
            print_fail(t_id, scenario, f"Log missing or high latency response ({elapsed_ms:.1f}ms).")
            report_data.append({"id": t_id, "type": "Regression", "scenario": scenario, "status": "Fail", "detail": "Database logging failure."})
    else:
        print_fail(t_id, scenario, f"Chatbot request failed. Got code {response.status_code}")
        report_data.append({"id": t_id, "type": "Regression", "scenario": scenario, "status": "Fail", "detail": str(response.content)})

    # Generate the gorgeous, interactive HTML report dashboard
    os.makedirs("docs", exist_ok=True)
    html_file = "docs/testing_validation_dashboard.html"
    
    # Calculate stats
    passed_count = sum(1 for item in report_data if item["status"] == "Pass")
    failed_count = sum(1 for item in report_data if item["status"] == "Fail")
    total_count = len(report_data)
    pass_pct = (passed_count / total_count * 100) if total_count > 0 else 0

    rows_html = ""
    for item in report_data:
        status_color = "#D4EFDF" if item["status"] == "Pass" else "#FADBD8"
        status_text_color = "#196F3D" if item["status"] == "Pass" else "#78281F"
        badge_style = f"background: {status_color}; color: {status_text_color}; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
        
        rows_html += f"""
        <tr>
            <td style="font-weight: bold; padding: 12px; border-bottom: 1px solid #E5E7EB;">{item['id']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">{item['type']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">{item['scenario']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;"><span style="{badge_style}">{item['status']}</span></td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #555;">{item['detail']}</td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Papyrus Plaza Testing Validation Dashboard</title>
    <style>
        body {{
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #F3F4F6;
            margin: 0;
            padding: 40px;
            color: #1F2937;
        }}
        .card {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            padding: 30px;
            max-width: 1100px;
            margin: auto;
        }}
        .header {{
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .title {{
            font-size: 28px;
            font-weight: 700;
            color: #2E4053;
            margin: 0;
        }}
        .subtitle {{
            font-size: 14px;
            color: #6B7280;
            margin-top: 5px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }}
        .stat-val {{
            font-size: 32px;
            font-weight: 700;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th {{
            background: #2E4053;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 class="title">Papyrus Plaza Bookstore Management System</h1>
            <div class="subtitle">Live Software Test & Verification Runner Dashboard (Django Client Env)</div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total Tested</div>
                <div class="stat-val" style="color: #1F2937;">{total_count}</div>
            </div>
            <div class="stat-card">
                <div style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Passed</div>
                <div class="stat-val" style="color: #196F3D;">{passed_count}</div>
            </div>
            <div class="stat-card">
                <div style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Failed</div>
                <div class="stat-val" style="color: #78281F;">{failed_count}</div>
            </div>
            <div class="stat-card">
                <div style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Pass Ratio</div>
                <div class="stat-val" style="color: #2471A3;">{pass_pct:.1f}%</div>
            </div>
        </div>
        
        <h2>Verification Activity Log</h2>
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Type</th>
                    <th>Scenario</th>
                    <th>Status</th>
                    <th>Validation Details</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
        
        <div style="margin-top: 40px; font-size: 11px; text-align: center; color: #9CA3AF;">
            Report generated automatically on {time.strftime('%Y-%m-%d %H:%M:%S')} | Environment: DRF / Django 6.0
        </div>
    </div>
</body>
</html>
"""
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print_header(f"TEST VALIDATION FINISHED | REPORT WRITTEN TO: {html_file}")


if __name__ == "__main__":
    run_validation_test_suite()
