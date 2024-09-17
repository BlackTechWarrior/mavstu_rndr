// course-details.js
document.addEventListener('DOMContentLoaded', function() {
    const courseDetailsContainer = document.getElementById('courseDetails');
    const urlParams = new URLSearchParams(window.location.search);
    const courseCode = urlParams.get('code');

    if (courseCode) {
        fetchCourseDetails(courseCode);
    } else {
        courseDetailsContainer.innerHTML = '<p>No course selected.</p>';
    }

    function fetchCourseDetails(courseCode) {
        console.log(`Attempting to fetch details for course: ${courseCode}`);
        fetch(`../course-details/${courseCode}/${courseCode}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(courseDetails => {
                console.log('Successfully fetched course details:', courseDetails);
                displayCourseDetails(courseCode, courseDetails);
            })
            .catch(error => {
                console.error('Error fetching course details:', error);
                courseDetailsContainer.innerHTML = `<p>Error loading course details: ${error.message}</p>`;
            });
    }

    function displayCourseDetails(courseCode, details) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) {
            courseDetailsContainer.innerHTML = '<p>Course not found.</p>';
            return;
        }

        const prerequisitesHtml = details.prerequisites.length 
        ? '<ul>' + details.prerequisites.map(prereq => `<li>${prereq}</li>`).join('') + '</ul>'
        : 'None';

        courseDetailsContainer.innerHTML = `
            <h1>${course.code}: ${course.name}</h1>
            <p>${course.description}</p>
            <h2>Prerequisites</h2>
            ${prerequisitesHtml}
            <h2>TCCN Equivalent</h2>
            <p>${details.tccnEquivalent || 'None'}</p>
            <h2>Resources</h2>
            
            <ul>
                ${details.resources.map(resource => `<li><a href="${resource.link}" target="_blank">${resource.name}</a></li>`).join('')}
            </ul>
            <h2>What People Are Saying</h2> 
            ${details.reviews.map(review => `<p><strong>${review.source}:</strong> ${review.content}</p>`).join('')}
            <p><a href="${details.utaLink}" target="_blank">View on UTA Website</a></p>
            <p><a href="course-catalog.html">Back to Course Catalog</a></p>
        `;
    }
});