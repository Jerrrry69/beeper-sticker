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

    // 初始化设置
    rotationControl.min = -180;
    rotationControl.max = 180;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';
    
    // 设置贴纸初始大小和位置
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
                uploadedImage.src = event.target.result;
                uploadedImage.onload = function() {
                    // Make sure the image is visible
                    uploadedImage.style.display = 'block';
                    uploadedImage.style.maxWidth = '100%';
                    uploadedImage.style.maxHeight = '100%';
                    
                    beeperSticker.style.display = 'block';
                    editorArea.style.display = 'block';
                    
                    // 重置贴纸位置和旋转
                    beeperSticker.dataset.x = 0;
                    beeperSticker.dataset.y = 0;
                    rotationControl.value = 0;
                    updatePosition();
                };
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
            alert('请先上传图片');
            return;
        }

        // 创建canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 加载背景图片
        const bgImg = new Image();
        bgImg.crossOrigin = 'Anonymous';
        bgImg.onload = function() {
            // Set canvas dimensions to match the original image dimensions
            canvas.width = bgImg.naturalWidth;
            canvas.height = bgImg.naturalHeight;
            
            // Calculate scaling factors
            const scaleX = bgImg.naturalWidth / uploadedImage.width;
            const scaleY = bgImg.naturalHeight / uploadedImage.height;
            
            // 绘制背景图片
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            
            // 加载贴纸图片
            const stickerImg = new Image();
            stickerImg.crossOrigin = 'Anonymous';
            stickerImg.onload = function() {
                // 计算贴纸尺寸
                const displayWidth = parseInt(beeperSticker.style.width) * scaleX;
                const displayHeight = stickerImg.naturalHeight * (displayWidth / stickerImg.naturalWidth);
                
                // 获取贴纸位置
                const transform = window.getComputedStyle(beeperSticker).transform;
                const matrix = new DOMMatrix(transform);
                const x = matrix.m41 * scaleX;
                const y = matrix.m42 * scaleY;
                
                // 绘制贴纸
                ctx.save();
                ctx.translate(x + displayWidth/2, y + displayHeight/2);
                ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
                ctx.drawImage(
                    stickerImg, 
                    -displayWidth/2, 
                    -displayHeight/2, 
                    displayWidth, 
                    displayHeight
                );
                ctx.restore();
                
                // 下载图片
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'beeper-sticker-image.png';
                link.href = dataURL;
                link.click();
            };
            stickerImg.src = beeperSticker.src;
        };
        bgImg.src = uploadedImage.src;
    });
});