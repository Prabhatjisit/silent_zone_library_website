document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. IntersectionObserver reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // 3. Screenshot Carousel Logic
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (track && prevBtn && nextBtn) {
        let currentIndex = 0;
        const slideWidth = 290; // width (260) + gap (30)
        const maxSlidesVisible = Math.floor(document.querySelector('.carousel-container').offsetWidth / slideWidth);
        const totalSlides = track.children.length;
        const maxIndex = Math.max(0, totalSlides - maxSlidesVisible);

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        };

        nextBtn.addEventListener('click', () => {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Wrap around
            }
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex; // Wrap around to end
            }
            updateCarousel();
        });

        // Dynamic adjustment on resize
        window.addEventListener('resize', () => {
            const containerWidth = document.querySelector('.carousel-container').offsetWidth;
            const updatedMaxSlides = Math.floor(containerWidth / slideWidth);
            const updatedMaxIndex = Math.max(0, totalSlides - updatedMaxSlides);
            if (currentIndex > updatedMaxIndex) {
                currentIndex = updatedMaxIndex;
                updateCarousel();
            }
        });
    }

    // 4. Smooth Anchor Link Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Supabase Initialization
    const SUPABASE_URL = 'https://supabase.nirajpaul.com';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
    
    let supabaseClient = null;
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase SDK not loaded.');
    }

    // 6. SHA-256 Hashing Function
    async function hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 7. Logo Upload & Preview Logic
    const logoDropzone = document.getElementById('logoDropzone');
    const logoInput = document.getElementById('logoInput');
    const logoPreviewContainer = document.getElementById('logoPreviewContainer');
    const logoPreview = document.getElementById('logoPreview');
    const removeLogoBtn = document.getElementById('removeLogoBtn');
    let selectedLogoFile = null;

    if (logoDropzone && logoInput) {
        logoDropzone.addEventListener('click', (e) => {
            if (e.target !== removeLogoBtn && !removeLogoBtn.contains(e.target)) {
                logoInput.click();
            }
        });

        logoInput.addEventListener('change', handleLogoSelect);

        // Drag and Drop
        logoDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            logoDropzone.classList.add('dragover');
        });

        logoDropzone.addEventListener('dragleave', () => {
            logoDropzone.classList.remove('dragover');
        });

        logoDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            logoDropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    logoInput.files = e.dataTransfer.files;
                    handleLogoSelect();
                }
            }
        });
    }

    function handleLogoSelect() {
        if (logoInput.files && logoInput.files[0]) {
            selectedLogoFile = logoInput.files[0];
            const objectUrl = URL.createObjectURL(selectedLogoFile);
            logoPreview.src = objectUrl;
            logoPreviewContainer.style.display = 'flex';
        }
    }

    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedLogoFile = null;
            logoInput.value = '';
            logoPreview.src = '';
            logoPreviewContainer.style.display = 'none';
        });
    }

    // 8. Form Submission Handlers
    const registerForm = document.getElementById('registerForm');
    const successCard = document.getElementById('successCard');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const registerError = document.getElementById('registerError');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!supabaseClient) {
                showError('Database connection error. Please refresh the page.');
                return;
            }

            const libName = document.getElementById('libName').value.trim();
            const ownerName = document.getElementById('ownerName').value.trim();
            const phone = document.getElementById('adminPhone').value.trim();
            const password = document.getElementById('adminPassword').value;

            // Simple validation
            if (phone.length !== 10 || isNaN(phone)) {
                showError('Phone number must be exactly 10 digits.');
                return;
            }
            if (password.length < 6) {
                showError('Password must be at least 6 characters.');
                return;
            }

            setLoading(true);
            registerError.style.display = 'none';

            try {
                // 1. Hash the password
                const hashedPassword = await hashPassword(password);

                // 2. Insert into libraries table
                const { data: libData, error: libError } = await supabaseClient
                    .from('libraries')
                    .insert([{ name: libName }])
                    .select();

                if (libError) throw libError;
                if (!libData || libData.length === 0) {
                    throw new Error('Failed to create library record.');
                }
                const libId = libData[0].id;

                // 3. Seed default batches for this library branch
                const { error: batchError } = await supabaseClient
                    .from('batches')
                    .insert([
                        { name: 'Morning', start_time: '06:00:00', end_time: '10:00:00', library_id: libId },
                        { name: 'Afternoon', start_time: '10:00:00', end_time: '14:00:00', library_id: libId },
                        { name: 'Evening', start_time: '14:00:00', end_time: '18:00:00', library_id: libId },
                        { name: 'Night', start_time: '18:00:00', end_time: '22:00:00', library_id: libId }
                    ]);

                if (batchError) {
                    await supabaseClient.from('libraries').delete().eq('id', libId);
                    throw new Error(`Failed to seed library batches: ${batchError.message}`);
                }

                // 4. Seed default camera device for this library branch
                const { error: deviceError } = await supabaseClient
                    .from('devices')
                    .insert([{
                        device_name: 'Main Camera',
                        camera_location: 'Library Entrance',
                        status: 'active',
                        library_id: libId
                    }]);

                if (deviceError) {
                    await supabaseClient.from('libraries').delete().eq('id', libId);
                    throw new Error(`Failed to register library camera device: ${deviceError.message}`);
                }

                // 5. Insert into admins table
                const { data: adminData, error: adminError } = await supabaseClient
                    .from('admins')
                    .insert([{
                        phone: phone,
                        password_hash: hashedPassword,
                        name: ownerName,
                        library_id: libId
                    }])
                    .select();

                if (adminError) {
                    await supabaseClient.from('libraries').delete().eq('id', libId);
                    throw adminError;
                }

                // 4. Success! Show generated QR Code Badge
                showSuccess(libName, selectedLogoFile);
            } catch (err) {
                console.error('Registration failed:', err);
                let msg = err.message || 'An unexpected error occurred. Please try again.';
                if (err.code === '23505') {
                    msg = 'This phone number is already registered as an admin.';
                }
                showError(msg);
                setLoading(false);
            }
        });
    }

    function showError(message) {
        registerError.textContent = '⚠️ ' + message;
        registerError.style.display = 'block';
        window.scrollTo({
            top: registerForm.offsetTop - 100,
            behavior: 'smooth'
        });
    }

    function setLoading(isLoading) {
        if (registerSubmitBtn) {
            registerSubmitBtn.disabled = isLoading;
            const textSpan = registerSubmitBtn.querySelector('span');
            if (textSpan) {
                textSpan.textContent = isLoading ? 'Registering Branch...' : 'Create Library Branch';
            }
        }
    }

    function showSuccess(libName, logoFile) {
        registerForm.style.display = 'none';
        successCard.style.display = 'block';

        // Update success card info
        document.getElementById('badgeLibName').textContent = libName;
        
        // Update logo preview in badge
        const badgeLogo = document.getElementById('badgeLogo');
        if (logoFile) {
            badgeLogo.src = URL.createObjectURL(logoFile);
        } else {
            badgeLogo.src = 'assets/images/logo.png';
        }

        // Set attendance QR image url
        const badgeQrImage = document.getElementById('badgeQrImage');
        badgeQrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NEXARA_LIBRARY_QR';

        // Scroll to success card
        window.scrollTo({
            top: successCard.offsetTop - 100,
            behavior: 'smooth'
        });
    }

    // 9. Printing and Downloading Badge
    const btnPrintQr = document.getElementById('btnPrintQr');
    const btnDownloadQr = document.getElementById('btnDownloadQr');

    if (btnPrintQr) {
        btnPrintQr.addEventListener('click', () => {
            window.print();
        });
    }

    if (btnDownloadQr) {
        btnDownloadQr.addEventListener('click', () => {
            const qrImageSrc = document.getElementById('badgeQrImage').src;
            const link = document.createElement('a');
            link.href = qrImageSrc;
            link.target = '_blank';
            link.download = 'silent-zone-attendance-qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 10. Delete Account Modal Logic
    const deleteModal     = document.getElementById('deleteAccountModal');
    const openDeleteBtn   = document.getElementById('openDeleteModalBtn');
    const closeDeleteBtn  = document.getElementById('closeDeleteModalBtn');
    const submitDeleteBtn = document.getElementById('submitDeleteBtn');
    const deletePhoneInput = document.getElementById('deletePhoneInput');
    const deleteErrorMsg  = document.getElementById('deleteErrorMsg');
    const deleteFormArea  = document.getElementById('deleteFormArea');
    const deleteSuccessArea = document.getElementById('deleteSuccessArea');

    function openDeleteModal() {
        if (deleteModal) {
            // Reset state each time
            if (deleteFormArea)   deleteFormArea.style.display = 'block';
            if (deleteSuccessArea) deleteSuccessArea.style.display = 'none';
            if (deletePhoneInput) deletePhoneInput.value = '';
            if (deleteErrorMsg)   { deleteErrorMsg.style.display = 'none'; deleteErrorMsg.textContent = ''; }
            if (submitDeleteBtn)  {
                submitDeleteBtn.disabled = false;
                document.getElementById('submitDeleteBtnText').textContent = 'Confirm Delete Request';
            }
            deleteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openDeleteBtn)  openDeleteBtn.addEventListener('click', openDeleteModal);
    if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', closeDeleteModal);

    // Close on backdrop click
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDeleteModal();
    });

    // Submit delete request
    if (submitDeleteBtn) {
        submitDeleteBtn.addEventListener('click', async () => {
            const phone = deletePhoneInput ? deletePhoneInput.value.trim() : '';

            // Validate phone
            if (!phone || phone.length !== 10 || isNaN(phone)) {
                deleteErrorMsg.textContent = '⚠️ Please enter a valid 10-digit phone number.';
                deleteErrorMsg.style.display = 'block';
                return;
            }

            deleteErrorMsg.style.display = 'none';
            submitDeleteBtn.disabled = true;
            document.getElementById('submitDeleteBtnText').textContent = 'Processing...';

            try {
                if (!supabaseClient) throw new Error('Database connection unavailable.');

                // Check if student exists with this phone
                const { data: students, error: fetchErr } = await supabaseClient
                    .from('students')
                    .select('id, name, mobile')
                    .eq('mobile', phone);

                if (fetchErr) throw fetchErr;

                if (!students || students.length === 0) {
                    throw new Error('No account found with this phone number. Please check and try again.');
                }

                // Delete student record(s) matching this phone
                const { error: deleteErr } = await supabaseClient
                    .from('students')
                    .delete()
                    .eq('mobile', phone);

                if (deleteErr) throw deleteErr;

                // Show success
                deleteFormArea.style.display = 'none';
                deleteSuccessArea.style.display = 'block';

            } catch (err) {
                console.error('Account deletion error:', err);
                deleteErrorMsg.textContent = '⚠️ ' + (err.message || 'Something went wrong. Please try again.');
                deleteErrorMsg.style.display = 'block';
                submitDeleteBtn.disabled = false;
                document.getElementById('submitDeleteBtnText').textContent = 'Confirm Delete Request';
            }
        });
    }
});

