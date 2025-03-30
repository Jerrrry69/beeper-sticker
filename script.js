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
    
    // 初始化旋转控制滑块，使中间为0°
    rotationControl.min = -180;
    rotationControl.max = 180;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';
    
    // 处理图片上传
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage.src = event.target.result;
                uploadedImage.style.display = 'block';
                beeperSticker.style.display = 'block';
                editorArea.style.display = 'block';
                
                // 重置贴纸位置和大小
                beeperSticker.dataset.x = 0;
                beeperSticker.dataset.y = 0;
                beeperSticker.style.width = '100px';
                updatePosition();
                
                rotationControl.value = 0;
                sizeControl.value = 100;
                rotationValue.textContent = '0°';
                sizeValue.textContent = '100%';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 旋转控制，左移为逆时针
    rotationControl.addEventListener('input', function() {
        const rotation = this.value;
        beeperSticker.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        rotationValue.textContent = `${rotation}°`;
    });
    
    // 大小控制
    sizeControl.addEventListener('input', function() {
        const size = this.value;
        beeperSticker.style.width = `${size}px`;
        sizeValue.textContent = `${size}%`;
    });
    
    // 改进的贴纸拖拽功能
    let startX, startY, initialX = 0, initialY = 0;
    
    function startDrag(e) {
        isDragging = true;
        const rect = beeperSticker.getBoundingClientRect();
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        initialX = parseFloat(beeperSticker.dataset.x) || 0;
        initialY = parseFloat(beeperSticker.dataset.y) || 0;
        beeperSticker.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const x = initialX + (clientX - startX);
        const y = initialY + (clientY - startY);
        
        beeperSticker.dataset.x = x;
        beeperSticker.dataset.y = y;
        updatePosition();
    }
    
    function stopDrag() {
        isDragging = false;
        beeperSticker.style.cursor = 'grab';
    }
    
    function updatePosition() {
        const rotation = rotationControl.value;
        const x = parseFloat(beeperSticker.dataset.x) || 0;
        const y = parseFloat(beeperSticker.dataset.y) || 0;
        
        beeperSticker.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    }
    
    // 添加鼠标和触摸事件
    beeperSticker.addEventListener('pointerdown', startDrag);
    beeperSticker.addEventListener('touchstart', startDrag);
    
    document.addEventListener('pointermove', doDrag);
    document.addEventListener('touchmove', doDrag);
    
    document.addEventListener('pointerup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    
    // 旋转时也更新位置
    rotationControl.addEventListener('input', updatePosition);
    
    // 下载功能
    downloadBtn.addEventListener('click', function() {
        if (!uploadedImage.src) {
            alert('请先上传图片');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;
        
        try {
            ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error('绘制图片失败:', e);
            alert('生成图片失败，请重试');
            return;
        }
        
        const stickerRect = beeperSticker.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        
        const scaleX = canvas.width / containerRect.width;
        const scaleY = canvas.height / containerRect.height;
        
        // 计算贴纸在canvas中的尺寸和位置
        const stickerWidth = beeperSticker.offsetWidth * scaleX;
        const stickerHeight = beeperSticker.offsetHeight * scaleY;
        
        // 计算贴纸中心点(基于transform的translate值)
        const x = parseFloat(beeperSticker.dataset.x) || 0;
        const y = parseFloat(beeperSticker.dataset.y) || 0;
        const stickerCenterX = canvas.width/2 + x * scaleX;
        const stickerCenterY = canvas.height/2 + y * scaleY;

        ctx.save();
        ctx.translate(stickerCenterX, stickerCenterY);
        ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
        
        ctx.drawImage(
            beeperSticker,
            -stickerWidth/2,
            -stickerHeight/2,
            stickerWidth,
            stickerHeight
        );
        
        ctx.restore();
        
        const link = document.createElement('a');
        link.download = 'beeper-sticker-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});