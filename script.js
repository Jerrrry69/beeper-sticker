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
                beeperSticker.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                beeperSticker.style.width = '100px';
                beeperSticker.style.left = '50%';
                beeperSticker.style.top = '50%';
                
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
    
    // 贴纸拖拽（按住即可拖动）
    beeperSticker.addEventListener('pointerdown', function(e) {
        isDragging = true;
        offsetX = e.clientX - beeperSticker.getBoundingClientRect().left;
        offsetY = e.clientY - beeperSticker.getBoundingClientRect().top;
        beeperSticker.style.cursor = 'grabbing';
    });
    
    document.addEventListener('pointermove', function(e) {
        if (!isDragging) return;
        
        const containerRect = imageContainer.getBoundingClientRect();
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;
        
        // 限制贴纸在容器内
        x = Math.max(0, Math.min(x, containerRect.width - beeperSticker.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.height - beeperSticker.offsetHeight));
        
        beeperSticker.style.left = `${x}px`;
        beeperSticker.style.top = `${y}px`;
    });
    
    document.addEventListener('pointerup', function() {
        isDragging = false;
        beeperSticker.style.cursor = 'grab';
    });
    
    // 下载功能
    downloadBtn.addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;
        
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        
        const stickerRect = beeperSticker.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        
        const scaleX = canvas.width / containerRect.width;
        const scaleY = canvas.height / containerRect.height;
        
        const stickerWidth = beeperSticker.offsetWidth * scaleX;
        const stickerHeight = (beeperSticker.offsetWidth * scaleX * beeperSticker.naturalHeight) / beeperSticker.naturalWidth;
        
        const stickerX = (stickerRect.left - containerRect.left) * scaleX;
        const stickerY = (stickerRect.top - containerRect.top) * scaleY;
        
        ctx.save();
        ctx.translate(stickerX + stickerWidth / 2, stickerY + stickerHeight / 2);
        ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
        
        ctx.drawImage(
            beeperSticker, 
            -stickerWidth / 2, 
            -stickerHeight / 2, 
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