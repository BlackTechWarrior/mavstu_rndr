document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const message = document.getElementById('message');
    const otpSection = document.getElementById('otpSection');
    const otpInput = document.getElementById('otp');
    const verifyOTPButton = document.getElementById('verifyOTP');
    const courseCatalogLink = document.getElementById('courseCatalogLink');

    // Check if the user has already signed up
    let hasSignedUp = localStorage.getItem('hasSignedUp') === 'true';
    
    console.log('Initial hasSignedUp:', hasSignedUp);

    if (hasSignedUp) {
        message.style.color = 'green';
        message.textContent = 'Welcome back! You have already signed up.';
        form.style.display = 'none';
        console.log('User has already signed up. Hiding form.');
    } else {
        console.log('New user. Showing form.');
    }

    function handleLockedLink(e) {
        if (!hasSignedUp) {
            e.preventDefault(); // Prevent the default link behavior
            message.style.color = '#d9534f';
            message.textContent = 'Please sign up first to access this page.';
            form.style.display = 'block';
            window.scrollTo(0, form.offsetTop); // Scroll to the form
        }
        // If hasSignedUp is true, the link will work normally
    }

    const lockedLinks = document.querySelectorAll('.locked-link');
    lockedLinks.forEach(link => {
        link.addEventListener('click', handleLockedLink);
    });
    

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value;
        
        // Regular expression for email validation
        const emailRegex = /^[a-z]{3}\d{4}@mavs\.uta\.edu$/i;
        
        console.log('Submitted email:', email);
        console.log('Email is valid:', emailRegex.test(email));

        if (emailRegex.test(email)) {
            if (!hasSignedUp) {
                sendOTP(email);
            } else {
                message.style.color = 'green';
                message.textContent = 'You have already signed up.';
                console.log('User already signed up. Showing message.');
            }
        } else {
            message.style.color = '#d9534f';
            message.textContent = 'Please use a valid mavs.uta.edu email address (e.g., abc1234@mavs.uta.edu).';
            console.log('Invalid email. Showing error message.');
        }
    });

    verifyOTPButton.addEventListener('click', function() {
        const email = emailInput.value;
        const otp = otpInput.value;
        verifyOTP(email, otp);
    });

    async function sendOTP(email) {
        try {
            const response = await axios.post('http://localhost:5000/api/send-otp', { email });
            if (response.data.success) {
                otpSection.style.display = 'block';
                message.style.color = 'green';
                message.textContent = 'OTP sent to your email.';
                console.log('OTP sent successfully');
            }
        } catch (error) {
            message.style.color = '#d9534f';
            message.textContent = 'Error sending OTP. Please try again.';
            console.log('Error sending OTP:', error);
        }
    }

    async function verifyOTP(email, otp) {
        try {
            const response = await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
            if (response.data.success) {
                otpSection.style.display = 'none';
                createAndShowModal(email);
                console.log('OTP verified successfully');
            } else {
                message.style.color = '#d9534f';
                message.textContent = 'Invalid OTP. Please try again.';
                console.log('Invalid OTP');
            }
        } catch (error) {
            message.style.color = '#d9534f';
            message.textContent = 'Error verifying OTP. Please try again.';
            console.log('Error verifying OTP:', error);
        }
    }

    function createAndShowModal(email) {
        const modal = document.createElement('div');
        modal.id = 'nameModal';
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <h2>Almost there!</h2>
            <p>Please enter your first name:</p>
            <input type="text" id="firstName" required>
            <button id="submitName">Submit</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        modal.style.display = 'block';
        
        const submitNameBtn = document.getElementById('submitName');
        const firstNameInput = document.getElementById('firstName');
        
        submitNameBtn.addEventListener('click', function() {
            const firstName = firstNameInput.value.trim();
            console.log('Submitted name:', firstName);

            if (firstName) {
                sendNameToServer(email, firstName);
                modal.style.display = 'none';
                message.style.color = 'green';
                message.textContent = `Thank you for signing up, ${firstName}!`;
                form.reset();
                
                // Set flag in localStorage to indicate the user has signed up
                localStorage.setItem('hasSignedUp', 'true');
                hasSignedUp = true;
                console.log('User signed up. Set hasSignedUp to true.');
                
                // Remove the modal from the DOM
                lockedLinks.forEach(link => {
                    link.classList.remove('locked-link');
                    link.removeEventListener('click', handleLockedLink);
                });
                document.body.removeChild(modal);
            } else {
                alert('Please enter your first name.');
                console.log('Empty name submitted. Showing alert.');
            }
        });

        async function sendNameToServer(email, name) {
            try {
                const response = await axios.post('http://localhost:5000/api/update-user', { email, name });
                if (response.data.success) {
                    console.log('Name sent to server successfully');
                } else {
                    console.log('Error sending name to server');
                }
            } catch (error) {
                console.log('Error sending name to server:', error);
            }
        }

        // Close the modal if user clicks outside of it
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                document.body.removeChild(modal);
                console.log('Closed modal by clicking outside');
            }
        });
    }
});