document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('job-form');
    const jobList = document.getElementById('job-list');
    const jobModal = new bootstrap.Modal(document.getElementById('jobModal'));
    const jobModalLabel = document.getElementById('jobModalLabel');

    let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

    const renderJobs = () => {
        jobList.innerHTML = '';
        if (jobs.length === 0) {
            jobList.innerHTML = '<tr><td colspan="5" class="text-center">No job applications added yet.</td></tr>';
            return;
        }

        jobs.forEach(job => {
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

    const getStatusClass = (status) => {
        switch (status) {
            case 'Interviewing':
                return 'bg-warning text-dark';
            case 'Offer':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'Applied':
            default:
                return 'bg-primary';
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
        renderJobs();
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
            renderJobs();
        }
    };
    
    // Reset modal title when it's closed
    document.getElementById('jobModal').addEventListener('hidden.bs.modal', () => {
        jobModalLabel.textContent = 'Add Job Application';
        jobForm.reset();
        document.getElementById('job-id').value = '';
    });


    renderJobs();
});
