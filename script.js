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

    // Initialize settings with larger size range
    rotationControl.min = -180;
    rotationControl.max = 180;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';
    
    // Set sticker size range (10px to 500px)
    sizeControl.min = 10;
    sizeControl.max = 500;
    sizeControl.value = 80;
    sizeValue.textContent = '80px';
    
    // Set initial sticker size and position
    beeperSticker.style.width = '80px';
    beeperSticker.dataset.x = 0;
    beeperSticker.dataset.y = 0;
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
                    
                    // Make sure container is properly sized
                    imageContainer.style.position = 'relative';
                    imageContainer.style.overflow = 'visible';
                    
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
        sizeValue.textContent = `${this.value}px`;
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
        if (!uploadedImage.src) {
            alert('请先上传图片');
            return;
        }
    
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.crossOrigin = 'Anonymous';
    
        bgImg.onload = function() {
            canvas.width = bgImg.naturalWidth;
            canvas.height = bgImg.naturalHeight;
            ctx.drawImage(bgImg, 0, 0);
    
            // 计算图片显示的缩放比例
            const displayedWidth = uploadedImage.clientWidth;
            const displayedHeight = uploadedImage.clientHeight;
            const scaleX = bgImg.naturalWidth / displayedWidth;
            const scaleY = bgImg.naturalHeight / displayedHeight;
    
            const stickerImg = new Image();
            stickerImg.crossOrigin = 'Anonymous';
            stickerImg.onload = function() {
                // 获取贴纸实际显示尺寸
                const stickerDisplayWidth = parseInt(beeperSticker.style.width);
                const stickerDisplayHeight = stickerImg.naturalHeight * (stickerDisplayWidth / stickerImg.naturalWidth);
    
                // 计算贴纸在 Canvas 中的位置（基于 getBoundingClientRect）
                const stickerRect = beeperSticker.getBoundingClientRect();
                const imageRect = uploadedImage.getBoundingClientRect();
                const x = (stickerRect.left - imageRect.left) * scaleX;
                const y = (stickerRect.top - imageRect.top) * scaleY;
    
                // 计算缩放后的贴纸尺寸
                const scaledWidth = stickerDisplayWidth * scaleX;
                const scaledHeight = stickerDisplayHeight * scaleY;
    
                // 绘制贴纸（含旋转）
                ctx.save();
                ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
                ctx.rotate((rotationControl.value * Math.PI) / 180);
                ctx.drawImage(stickerImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                ctx.restore();
    
                // 触发下载
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'sticker-image.png';
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };
            stickerImg.src = beeperSticker.src;
        };
        bgImg.src = uploadedImage.src;
    });
    
});