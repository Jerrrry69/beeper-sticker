document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const imageContainer = document.getElementById('imageContainer');
    const uploadedImage = document.getElementById('uploadedImage');
    const beeperSticker = document.getElementById('beeperSticker');
    const rotationControl = document.getElementById('rotationControl');
    const sizeControl = document.getElementById('sizeControl');
    const rotationValue = document.getElementById('rotationValue');
    const sizeValue = document.getElementById('sizeValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const editorArea = document.querySelector('.editor-area');

    let isDragging = false;

    // Initialize settings
    rotationControl.min = -180;
    rotationControl.max = 180;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';
    
    // Set initial sticker size and position
    beeperSticker.style.width = '80px';
    beeperSticker.dataset.x = 0;
    beeperSticker.dataset.y = 0;
    sizeControl.value = 80;
    sizeValue.textContent = '80%';
    updatePosition();

    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Create new image to ensure proper loading
                const img = new Image();
                img.onload = function() {
                    uploadedImage.src = event.target.result;
                    uploadedImage.style.display = 'block';
                    uploadedImage.style.maxWidth = '100%';
                    uploadedImage.style.maxHeight = '100%';
                    
                    // Reset container dimensions
                    imageContainer.style.width = '100%';
                    imageContainer.style.height = 'auto';
                    imageContainer.style.position = 'relative';
                    
                    beeperSticker.style.display = 'block';
                    editorArea.style.display = 'block';
                    
                    // Reset sticker position and rotation
                    beeperSticker.dataset.x = 0;
                    beeperSticker.dataset.y = 0;
                    rotationControl.value = 0;
                    updatePosition();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    rotationControl.addEventListener('input', function() {
        updatePosition();
        rotationValue.textContent = `${this.value}°`;
    });
    
    sizeControl.addEventListener('input', function() {
        beeperSticker.style.width = `${this.value}px`;
        sizeValue.textContent = `${this.value}%`;
        updatePosition();
    });
    
    let startX, startY, initialX = 0, initialY = 0;
    
    function startDrag(e) {
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        initialX = parseFloat(beeperSticker.dataset.x) || 0;
        initialY = parseFloat(beeperSticker.dataset.y) || 0;
        e.preventDefault();
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        beeperSticker.dataset.x = initialX + (clientX - startX);
        beeperSticker.dataset.y = initialY + (clientY - startY);
        updatePosition();
    }
    
    function stopDrag() {
        isDragging = false;
    }
    
    function updatePosition() {
        const rotation = rotationControl.value;
        const x = parseFloat(beeperSticker.dataset.x) || 0;
        const y = parseFloat(beeperSticker.dataset.y) || 0;
        beeperSticker.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    }
    
    beeperSticker.addEventListener('pointerdown', startDrag);
    document.addEventListener('pointermove', doDrag);
    document.addEventListener('pointerup', stopDrag);
    
    downloadBtn.addEventListener('click', function() {
        if (!uploadedImage.src || uploadedImage.src === '') {
            alert('Please upload an image first');
            return;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create temporary image to ensure proper dimensions
        const tempImg = new Image();
        tempImg.onload = function() {
            // Set canvas to original image dimensions
            canvas.width = tempImg.naturalWidth;
            canvas.height = tempImg.naturalHeight;
            
            // Draw background image
            ctx.drawImage(tempImg, 0, 0);
            
            // Calculate scaling factors
            const displayedWidth = uploadedImage.clientWidth;
            const displayedHeight = uploadedImage.clientHeight;
            const scaleX = tempImg.naturalWidth / displayedWidth;
            const scaleY = tempImg.naturalHeight / displayedHeight;
            
            // Load sticker
            const stickerImg = new Image();
            stickerImg.onload = function() {
                // Get sticker dimensions
                const stickerDisplayWidth = parseInt(beeperSticker.style.width);
                const stickerDisplayHeight = stickerImg.naturalHeight * (stickerDisplayWidth / stickerImg.naturalWidth);
                
                // Get sticker position (accounting for scaling)
                const transform = window.getComputedStyle(beeperSticker).transform;
                const matrix = new DOMMatrix(transform);
                const x = matrix.m41 * scaleX;
                const y = matrix.m42 * scaleY;
                
                // Calculate scaled sticker dimensions
                const scaledStickerWidth = stickerDisplayWidth * scaleX;
                const scaledStickerHeight = stickerDisplayHeight * scaleY;
                
                // Draw sticker with rotation
                ctx.save();
                ctx.translate(x + scaledStickerWidth/2, y + scaledStickerHeight/2);
                ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
                ctx.drawImage(
                    stickerImg, 
                    -scaledStickerWidth/2, 
                    -scaledStickerHeight/2, 
                    scaledStickerWidth, 
                    scaledStickerHeight
                );
                ctx.restore();
                
                // Download image
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'sticker-image.png';
                link.href = dataURL;
                link.click();
            };
            stickerImg.src = beeperSticker.src;
        };
        tempImg.src = uploadedImage.src;
    });
});