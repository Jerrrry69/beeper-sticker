document.addEventListener('DOMContentLoaded', function() {
    // 获取所有DOM元素
    const imageUpload = document.getElementById('imageUpload');
    const uploadedImage = document.getElementById('uploadedImage');
    const beeperSticker = document.getElementById('beeperSticker');
    const imageContainer = document.getElementById('imageContainer');
    const rotationControl = document.getElementById('rotationControl');
    const sizeControl = document.getElementById('sizeControl');
    const downloadBtn = document.getElementById('downloadBtn');

    // 状态变量
    let isDragging = false;
    let startX, startY, initialX = 0, initialY = 0;
    let scaleFactor = 1; // 新增：图片缩放比例

    // 初始化贴纸尺寸
    beeperSticker.style.width = "50px"; // 初始尺寸调整为50px
    sizeControl.value = 50; // 同步调整滑块初始值
    document.getElementById('sizeValue').textContent = '50%';

    // 图片上传逻辑
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage.onload = function() {
                    // 计算图片显示尺寸
                    const containerWidth = imageContainer.offsetWidth;
                    const containerHeight = imageContainer.offsetHeight;
                    const imgRatio = this.naturalWidth / this.naturalHeight;
                    const containerRatio = containerWidth / containerHeight;

                    // 计算实际显示尺寸
                    let displayWidth, displayHeight;
                    if (imgRatio > containerRatio) {
                        displayWidth = containerWidth;
                        displayHeight = containerWidth / imgRatio;
                    } else {
                        displayHeight = containerHeight;
                        displayWidth = containerHeight * imgRatio;
                    }

                    // 设置图片显示尺寸
                    uploadedImage.style.width = `${displayWidth}px`;
                    uploadedImage.style.height = `${displayHeight}px`;
                    uploadedImage.style.display = 'block';

                    // 计算缩放比例
                    scaleFactor = this.naturalWidth / displayWidth;

                    // 显示编辑器
                    document.querySelector('.editor-area').style.display = 'block';
                    beeperSticker.style.display = 'block';
                    resetStickerPosition();
                };
                uploadedImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 贴纸拖拽逻辑
    beeperSticker.addEventListener('pointerdown', startDrag);
    document.addEventListener('pointermove', doDrag);
    document.addEventListener('pointerup', stopDrag);

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = parseFloat(beeperSticker.dataset.x) || 0;
        initialY = parseFloat(beeperSticker.dataset.y) || 0;
        e.preventDefault();
    }

    function doDrag(e) {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        beeperSticker.dataset.x = initialX + deltaX;
        beeperSticker.dataset.y = initialY + deltaY;
        updatePosition();
    }

    function stopDrag() {
        isDragging = false;
    }

    // 控制逻辑
    rotationControl.addEventListener('input', function() {
        document.getElementById('rotationValue').textContent = `${this.value}°`;
        updatePosition();
    });

    sizeControl.addEventListener('input', function() {
        beeperSticker.style.width = `${this.value}px`;
        document.getElementById('sizeValue').textContent = `${this.value}%`;
    });

    function updatePosition() {
        const x = parseFloat(beeperSticker.dataset.x) || 0;
        const y = parseFloat(beeperSticker.dataset.y) || 0;
        beeperSticker.style.transform = `
            translate(${x}px, ${y}px)
            rotate(${rotationControl.value}deg)
        `;
    }

    // 下载功能（核心修复）
    downloadBtn.addEventListener('click', function() {
        if (!uploadedImage.complete) {
            alert('请等待图片加载完成');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布为原始图片尺寸
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;

        // 绘制背景图片
        ctx.drawImage(uploadedImage, 0, 0);

        // 获取贴纸实际位置
        const stickerRect = beeperSticker.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();

        // 计算相对位置（考虑滚动偏移）
        const x = stickerRect.left - containerRect.left;
        const y = stickerRect.top - containerRect.top;

        // 转换为原始图片坐标
        const originX = x * scaleFactor;
        const originY = y * scaleFactor;
        const originWidth = stickerRect.width * scaleFactor;
        const originHeight = stickerRect.height * scaleFactor;

        // 绘制贴纸
        ctx.save();
        ctx.translate(
            originX + originWidth/2, 
            originY + originHeight/2
        );
        ctx.rotate(rotationControl.value * Math.PI / 180);
        ctx.drawImage(
            beeperSticker,
            -originWidth/2,
            -originHeight/2,
            originWidth,
            originHeight
        );
        ctx.restore();

        // 触发下载
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    function resetStickerPosition() {
        beeperSticker.dataset.x = 0;
        beeperSticker.dataset.y = 0;
        rotationControl.value = 0;
        sizeControl.value = 50;
        updatePosition();
    }
});
