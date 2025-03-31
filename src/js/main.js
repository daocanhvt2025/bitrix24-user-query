import '../sass/styles.scss';
import 'bootstrap';
import axios from 'axios';

class EmployeeApp {
    constructor() {
        this.employeeList = document.getElementById('employeeList');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.viewBtn = document.getElementById('viewBtn');
        this.selectedEmployee = null;

        this.initEventListeners();
        this.fetchEmployees();
    }

    initEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.fetchEmployees());
        this.viewBtn.addEventListener('click', () => this.showEmployeeDetails());
    }

    async getAccessToken() {
        try {
            const response = await axios.get('https://bx-oauth2.aasc.com.vn/bx/oauth2_token/local.67e8fe627beac7.26116572');
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    async fetchEmployees() {
        try {
            const token = await this.getAccessToken();
            if (!token) return;

            const response = await axios.get('https://cdigitrans.bitrix24.vn/rest/user.get', {
                params: {
                    auth: token
                }
            });

            this.renderEmployees(response.data.result);
        } catch (error) {
            console.error('Error fetching employees:', error);
            this.employeeList.innerHTML = '<li class="list-group-item">Error loading employees</li>';
        }
    }

    renderEmployees(employees) {
        this.employeeList.innerHTML = '';
        this.viewBtn.disabled = true;
        
        employees.forEach(employee => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = employee.NAME + ' ' + employee.LAST_NAME;
            li.dataset.id = employee.ID;
            
            li.addEventListener('click', () => {
                if (this.selectedEmployee) {
                    this.selectedEmployee.classList.remove('highlighted');
                }
                li.classList.add('highlighted');
                this.selectedEmployee = li;
                this.viewBtn.disabled = false;
            });
            
            this.employeeList.appendChild(li);
        });
    }

    async showEmployeeDetails() {
        if (!this.selectedEmployee) return;

        try {
            const token = await this.getAccessToken();
            const employeeId = this.selectedEmployee.dataset.id;
            
            const response = await axios.get('https://cdigitrans.bitrix24.vn/rest/user.get', {
                params: {
                    ID: employeeId,
                    auth: token
                }
            });

            const employee = response.data.result[0];
            const details = `
                <p><strong>Name:</strong> ${employee.NAME} ${employee.LAST_NAME}</p>
                <p><strong>Email:</strong> ${employee.EMAIL || 'N/A'}</p>
                <p><strong>Position:</strong> ${employee.WORK_POSITION || 'N/A'}</p>
            `;

            document.getElementById('employeeDetails').innerHTML = details;
            $('#employeeModal').modal('show');
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    }
}

new EmployeeApp();