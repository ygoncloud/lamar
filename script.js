document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('job-form');
    const jobList = document.getElementById('job-list');
    const jobModal = new bootstrap.Modal(document.getElementById('jobModal'));
    const jobModalLabel = document.getElementById('jobModalLabel');
    const searchInput = document.getElementById('search-input');

    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

    const sortJobs = (column) => {
        if (currentSortColumn === column) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            currentSortDirection = 'asc';
        }

        jobs.sort((a, b) => {
            const valA = a[column];
            const valB = b[column];

            if (valA < valB) {
                return currentSortDirection === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return currentSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        updateSortIcons();
        filterJobs();
    };

    const updateSortIcons = () => {
        document.querySelectorAll('.sortable').forEach(header => {
            const icon = header.querySelector('i');
            if (header.dataset.sort === currentSortColumn) {
                icon.className = `fas fa-sort-${currentSortDirection === 'asc' ? 'up' : 'down'}`;
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    };

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortJobs(header.dataset.sort);
        });
    });

    const renderJobs = (jobsToRender = jobs) => {
        jobList.innerHTML = '';
        if (jobsToRender.length === 0) {
            jobList.innerHTML = '<tr><td colspan="7" class="text-center">No job applications found.</td></tr>';
            return;
        }

        jobsToRender.forEach(job => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${job.company}</td>
                <td>${job.title}</td>
                <td>${job.date}</td>
                <td>${job.jobLink ? `<a href="${job.jobLink}" target="_blank">Link</a>` : 'N/A'}</td>
                <td>${job.location || 'N/A'}</td>
                <td><span class="badge ${getStatusClass(job.status)}">${job.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editJob('${job.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteJob('${job.id}')">Delete</button>
                </td>
            `;
            jobList.appendChild(tr);
        });
    };

    const filterJobs = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredJobs = jobs.filter(job =>
            job.company.toLowerCase().includes(searchTerm) ||
            job.title.toLowerCase().includes(searchTerm) ||
            (job.location && job.location.toLowerCase().includes(searchTerm)) ||
            job.status.toLowerCase().includes(searchTerm)
        );
        renderJobs(filteredJobs);
    };

    searchInput.addEventListener('keyup', filterJobs);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Interviewing':
                return 'status-interviewing';
            case 'Offer':
                return 'status-offer';
            case 'Rejected':
                return 'status-rejected';
            case 'Applied':
            default:
                return 'status-applied';
        }
    };

    jobForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('job-id').value;
        const company = document.getElementById('company-name').value;
        const title = document.getElementById('job-title').value;
        const date = document.getElementById('date-applied').value;
        const jobLink = document.getElementById('job-link').value;
        const location = document.getElementById('job-location').value;
        const status = document.getElementById('status').value;

        if (id) {
            // Editing existing job
            const jobIndex = jobs.findIndex(job => job.id === id);
            if (jobIndex > -1) {
                jobs[jobIndex] = { ...jobs[jobIndex], company, title, date, jobLink, location, status };
            }
        } else {
            // Adding new job
            const newJob = {
                id: Date.now().toString(),
                company,
                title,
                date,
                jobLink,
                location,
                status
            };
            jobs.push(newJob);
        }

        localStorage.setItem('jobs', JSON.stringify(jobs));
        filterJobs();
        jobModal.hide();
        jobForm.reset();
        document.getElementById('job-id').value = '';
    });

    window.editJob = (id) => {
        const job = jobs.find(job => job.id === id);
        if (job) {
            jobModalLabel.textContent = 'Edit Job Application';
            document.getElementById('job-id').value = job.id;
            document.getElementById('company-name').value = job.company;
            document.getElementById('job-title').value = job.title;
            document.getElementById('date-applied').value = job.date;
            document.getElementById('job-link').value = job.jobLink || '';
            document.getElementById('job-location').value = job.location || '';
            document.getElementById('status').value = job.status;
            jobModal.show();
        }
    };

    window.deleteJob = (id) => {
        if (confirm('Are you sure you want to delete this application?')) {
            jobs = jobs.filter(job => job.id !== id);
            localStorage.setItem('jobs', JSON.stringify(jobs));
            filterJobs();
        }
    };
    
    // Reset modal title when it's closed
    document.getElementById('jobModal').addEventListener('hidden.bs.modal', () => {
        jobModalLabel.textContent = 'Add Job Application';
        jobForm.reset();
        document.getElementById('job-id').value = '';
    });


    filterJobs();

    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeSwitch.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeSwitch.checked = false;
        }
    };

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        } else {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    const exportToCsv = () => {
        const headers = ['Company', 'Job Title', 'Date Applied', 'Link', 'Location', 'Status'];
        const csvRows = [headers.join(',')];

        jobs.forEach(job => {
            const row = [
                job.company,
                job.title,
                job.date,
                job.jobLink || '',
                job.location || '',
                job.status
            ].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'job_applications.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    document.getElementById('export-csv').addEventListener('click', exportToCsv);

    // Import CSV functionality
    const importCsvButton = document.getElementById('import-csv-button');
    const importCsvInput = document.getElementById('import-csv-input');

    importCsvButton.addEventListener('click', () => {
        importCsvInput.click();
    });

    importCsvInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csvString = e.target.result;
                try {
                    const importedJobs = parseCsvToJobs(csvString);
                    // Add new unique IDs to imported jobs
                    const jobsWithNewIds = importedJobs.map(job => ({ ...job, id: Date.now().toString() + Math.random().toString(36).substring(2, 9) }));
                    jobs = [...jobs, ...jobsWithNewIds]; // Append imported jobs
                    localStorage.setItem('jobs', JSON.stringify(jobs));
                    filterJobs();
                    alert('Job applications imported successfully!');
                } catch (error) {
                    alert('Error parsing CSV file: ' + error.message);
                }
            };
            reader.readAsText(file);
            // Reset the input value to allow importing the same file again
            event.target.value = '';
        }
    });

    const parseCsvToJobs = (csvString) => {
        const lines = csvString.trim().split('\n');
        if (lines.length === 0) {
            return [];
        }

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase().replace(/\s/g, ''));
        const jobData = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            if (currentLine.length !== headers.length) {
                console.warn(`Skipping malformed row: ${lines[i]}`);
                continue; // Skip malformed rows
            }
            const job = {};
            headers.forEach((header, index) => {
                job[header] = currentLine[index].trim();
            });
            // Map CSV headers to expected job object properties
            jobData.push({
                company: job.company || '',
                title: job.jobtitle || '',
                date: job.dateapplied || '',
                jobLink: job.link || '',
                location: job.location || '',
                status: job.status || ''
            });
        }
        return jobData;
    };

    document.getElementById('logout-button').addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
});
