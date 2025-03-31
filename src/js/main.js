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

    // Tạm thời hardcode token từ curl
    getAccessToken() {
        return "e4c1ea6700774df500774deb00000001403807a0ba2f64146b1cf8e9b93ff68e605866";
    }

    async fetchEmployees() {
        this.employeeList.innerHTML = '<li class="list-group-item">Loading...</li>';
        try {
            const token = this.getAccessToken();
            if (!token) {
                this.employeeList.innerHTML = '<li class="list-group-item">Authentication failed</li>';
                return;
            }

            const response = await axios.get('https://cdigitrans.bitrix24.vn/rest/user.get', {
                params: { auth: token }
            });
            console.log('Employee Data:', response.data);

            if (response.data.result) {
                this.renderEmployees(response.data.result);
            } else {
                this.employeeList.innerHTML = '<li class="list-group-item">No employees found</li>';
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            this.employeeList.innerHTML = '<li class="list-group-item">Error: ' + error.message + '</li>';
        }
    }

    renderEmployees(employees) {
        this.employeeList.innerHTML = '';
        this.viewBtn.disabled = true;

        if (!employees || employees.length === 0) {
            this.employeeList.innerHTML = '<li class="list-group-item">No employees available</li>';
            return;
        }

        employees.forEach(employee => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${employee.NAME || ''} ${employee.LAST_NAME || ''}`.trim() || 'Unnamed Employee';
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
            const token = this.getAccessToken();
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
                <p><strong>Last Login:</strong> ${employee.LAST_LOGIN || 'N/A'}</p>
            `;

            document.getElementById('employeeDetails').innerHTML = details;
            $('#employeeModal').modal('show');
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    }
}

new EmployeeApp();