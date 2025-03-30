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
    let offsetX, offsetY;

    // 初始化设置
    rotationControl.min = -180;
    rotationControl.max = 180;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';
    
    // 设置贴纸初始大小
    beeperSticker.style.width = '80px';
    sizeControl.value = 80;
    sizeValue.textContent = '80%';

    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage.src = event.target.result;
                uploadedImage.onload = function() {
                    uploadedImage.style.display = 'block';
                    beeperSticker.style.display = 'block';
                    editorArea.style.display = 'block';
                    
                    // 重置贴纸位置
                    beeperSticker.style.transform = 'translate(0px, 0px) rotate(0deg)';
                    rotationControl.value = 0;
                    rotationValue.textContent = '0°';
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
        if (!uploadedImage.src) {
            alert('请先上传图片');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 等待图片加载完成
        const img = new Image();
        img.onload = function() {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // 绘制背景图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // 绘制贴纸
            const sticker = new Image();
            sticker.onload = function() {
                const stickerWidth = parseInt(beeperSticker.style.width);
                const stickerHeight = sticker.naturalHeight * (stickerWidth / sticker.naturalWidth);
                
                const transform = window.getComputedStyle(beeperSticker).transform;
                const matrix = new DOMMatrix(transform);
                const x = matrix.m41;
                const y = matrix.m42;
                
                ctx.save();
                ctx.translate(x + stickerWidth/2, y + stickerHeight/2);
                ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
                ctx.drawImage(sticker, -stickerWidth/2, -stickerHeight/2, stickerWidth, stickerHeight);
                ctx.restore();
                
                // 下载图片
                const dataURL = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'beeper-sticker-image.png';
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            sticker.src = beeperSticker.src;
        };
        img.src = uploadedImage.src;
    });
});
