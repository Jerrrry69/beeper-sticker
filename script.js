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
    let startX, startY, startLeft, startTop;
    
    // 初始化旋转滑块
    rotationControl.value = 180;
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
                beeperSticker.style.width = '100px';
                beeperSticker.style.left = '50%';
                beeperSticker.style.top = '50%';
                beeperSticker.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                
                rotationControl.value = 180;
                sizeControl.value = 100;
                rotationValue.textContent = '0°';
                sizeValue.textContent = '100%';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 旋转控制 (-180°到180°)
    rotationControl.addEventListener('input', function() {
        const rotation = parseInt(this.value) - 180;
        beeperSticker.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        rotationValue.textContent = `${rotation}°`;
    });
    
    // 大小控制
    sizeControl.addEventListener('input', function() {
        const size = this.value;
        beeperSticker.style.width = `${size}px`;
        sizeValue.textContent = `${size}%`;
    });
    
    // 改进的拖拽功能 - 按住即可拖动
    beeperSticker.addEventListener('mousedown', function(e) {
        isDragging = true;
        
        // 获取初始位置
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(beeperSticker.style.left) || imageContainer.offsetWidth / 2;
        startTop = parseInt(beeperSticker.style.top) || imageContainer.offsetHeight / 2;
        
        beeperSticker.style.cursor = 'grabbing';
        e.preventDefault(); // 防止文本选中
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const containerRect = imageContainer.getBoundingClientRect();
        
        // 计算新位置
        let newLeft = startLeft + (e.clientX - startX);
        let newTop = startTop + (e.clientY - startY);
        
        // 限制在容器内
        newLeft = Math.max(0, Math.min(newLeft, containerRect.width));
        newTop = Math.max(0, Math.min(newTop, containerRect.height));
        
        beeperSticker.style.left = `${newLeft}px`;
        beeperSticker.style.top = `${newTop}px`;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        beeperSticker.style.cursor = 'grab';
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
        const rotation = parseInt(rotationControl.value) - 180;
        
        // 保存当前状态
        ctx.save();
        
        // 移动到贴纸中心
        ctx.translate(stickerX + stickerWidth / 2, stickerY + stickerHeight / 2);
        
        // 旋转
        ctx.rotate(rotation * Math.PI / 180);
        
        // 绘制贴纸
        ctx.drawImage(
            beeperSticker, 
            -stickerWidth / 2, 
            -stickerHeight / 2, 
            stickerWidth, 
            sticker