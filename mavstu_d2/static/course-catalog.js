// course-catalog.js
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('courseSearch');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('courseResults');

    searchButton.addEventListener('click', searchCourses);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCourses();
        }
    });

    function searchCourses() {
        const searchTerm = searchInput.value.toLowerCase().replace(/\s+/g, '').trim();
        
        if (searchTerm === '') {
            resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }
    
        let filteredCourses;
    
        if (searchTerm === 'all' || searchTerm === 'list') {
            filteredCourses = courses; // Display all courses
        } else {
            filteredCourses = courses.filter(course => 
                course.code.toLowerCase().replace(/\s+/g, '').includes(searchTerm) ||
                course.name.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            );
        }
    
        displayResults(filteredCourses);
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No courses found.</p>';
            return;
        }

        results.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.classList.add('course-item');
            courseElement.innerHTML = `
                <h3><a href="course-details.html?code=${course.code}" class="course-title">${course.code}: ${course.name}</a></h3>
                <p>${course.description}</p>
            `;
            resultsContainer.appendChild(courseElement);
        });
    }
});