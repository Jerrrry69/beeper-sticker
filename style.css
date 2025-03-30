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
                beeperSticker.style.transform = 'rotate(0deg)';
                beeperSticker.style.width = '100px';
                beeperSticker.style.left = '50%';
                beeperSticker.style.top = '50%';
                beeperSticker.style.transform = 'translate(-50%, -50%)';
                
                rotationControl.value = 0;
                sizeControl.value = 100;
                rotationValue.textContent = '0°';
                sizeValue.textContent = '100%';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 旋转控制
    rotationControl.addEventListener('input', function() {
        const rotation = this.value;
        beeperSticker.style.transform = `rotate(${rotation}deg)`;
        rotationValue.textContent = `${rotation}°`;
    });
    
    // 大小控制
    sizeControl.addEventListener('input', function() {
        const size = this.value;
        beeperSticker.style.width = `${size}px`;
        sizeValue.textContent = `${size}%`;
    });
    
    // 拖拽功能
    beeperSticker.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - beeperSticker.getBoundingClientRect().left;
        offsetY = e.clientY - beeperSticker.getBoundingClientRect().top;
        beeperSticker.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const containerRect = imageContainer.getBoundingClientRect();
        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;
        
        // 限制在容器内
        x = Math.max(0, Math.min(x, containerRect.width - beeperSticker.offsetWidth));
        y = Math.max(0, Math.min(y, containerRect.height - beeperSticker.offsetHeight));
        
        beeperSticker.style.left = `${x}px`;
        beeperSticker.style.top = `${y}px`;
        beeperSticker.style.transform = `rotate(${rotationControl.value}deg)`;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        beeperSticker.style.cursor = 'move';
    });
    
    // 下载功能
    downloadBtn.addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置canvas大小与图片相同
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;
        
        // 绘制背景图片
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        
        // 计算贴纸在canvas上的位置和大小
        const stickerRect = beeperSticker.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();
        
        const scaleX = canvas.width / containerRect.width;
        const scaleY = canvas.height / containerRect.height;
        
        const stickerWidth = beeperSticker.offsetWidth * scaleX;
        const stickerHeight = (beeperSticker.offsetWidth * scaleX * beeperSticker.naturalHeight) / beeperSticker.naturalWidth;
        
        const stickerX = (stickerRect.left - containerRect.left) * scaleX;
        const stickerY = (stickerRect.top - containerRect.top) * scaleY;
        
        // 保存当前状态
        ctx.save();
        
        // 移动到贴纸中心
        ctx.translate(stickerX + stickerWidth / 2, stickerY + stickerHeight / 2);
        
        // 旋转
        ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
        
        // 绘制贴纸
        ctx.drawImage(
            beeperSticker, 
            -stickerWidth / 2, 
            -stickerHeight / 2, 
            stickerWidth, 
            stickerHeight
        );
        
        // 恢复状态
        ctx.restore();
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'beeper-sticker-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});