// 初始化变量
let isDragging = false;
let startX, startY;
let initialX = 0, initialY = 0;
let currentRotation = 0;

// 获取DOM元素
const rotationControl = document.getElementById('rotationControl');
const rotationValue = document.getElementById('rotationValue');
const beeperSticker = document.getElementById('beeperSticker');
const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const uploadArea = document.getElementById('uploadArea');
const editorArea = document.querySelector('.editor-area');

// 旋转控制初始化 - 设置中间值并调整方向
rotationControl.min = -180;
rotationControl.max = 180;
rotationControl.value = 0;

// 旋转控制事件监听
rotationControl.addEventListener('input', function() {
    currentRotation = parseInt(this.value);
    rotationValue.textContent = `${currentRotation}°`;
    beeperSticker.style.transform = `rotate(${currentRotation}deg)`;
});

// 图片上传处理
imageUpload.addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImage.src = event.target.result;
            uploadedImage.style.display = 'block';
            beeperSticker.style.display = 'block';
            uploadArea.style.display = 'none';
            editorArea.style.display = 'block';
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// 贴纸拖动功能 - 按住即可拖动
beeperSticker.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = parseInt(beeperSticker.style.left) || 0;
    initialY = parseInt(beeperSticker.style.top) || 0;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
});

function handleDrag(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    beeperSticker.style.left = `${initialX + dx}px`;
    beeperSticker.style.top = `${initialY + dy}px`;
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
}