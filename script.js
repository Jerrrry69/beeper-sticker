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

    let isDragging = false;
    let offsetX, offsetY;

    rotationControl.min = 0;
    rotationControl.max = 360;
    rotationControl.value = 0;
    rotationValue.textContent = '0°';

    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage.onload = function() {
                    const containerWidth = imageContainer.offsetWidth;
                    const containerHeight = imageContainer.offsetHeight;
                    const ratio = Math.min(
                        containerWidth / this.naturalWidth,
                        containerHeight / this.naturalHeight
                    );

                    uploadedImage.style.width = `${this.naturalWidth * ratio}px`;
                    uploadedImage.style.height = `${this.naturalHeight * ratio}px`;

                    beeperSticker.style.display = 'block';
                    document.querySelector('.editor-area').style.display = 'block';
                    resetStickerPosition();
                };
                uploadedImage.src = event.target.result;
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

    function getScalingFactors() {
        const displayedWidth = uploadedImage.offsetWidth;
        const displayedHeight = uploadedImage.offsetHeight;
        return {
            scaleX: uploadedImage.naturalWidth / displayedWidth,
            scaleY: uploadedImage.naturalHeight / displayedHeight
        };
    }

    downloadBtn.addEventListener('click', function() {
        if (!uploadedImage.src) {
            alert('请先上传图片');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = uploadedImage.naturalWidth;
        canvas.height = uploadedImage.naturalHeight;

        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

        const scale = getScalingFactors();

        const stickerRect = beeperSticker.getBoundingClientRect();
        const containerRect = imageContainer.getBoundingClientRect();

        const x = stickerRect.left - containerRect.left;
        const y = stickerRect.top - containerRect.top;

        const scaledX = x * scale.scaleX;
        const scaledY = y * scale.scaleY;
        const scaledWidth = stickerRect.width * scale.scaleX;
        const scaledHeight = stickerRect.height * scale.scaleY;

        ctx.save();
        ctx.translate(scaledX + scaledWidth/2, scaledY + scaledHeight/2);
        ctx.rotate(parseInt(rotationControl.value) * Math.PI / 180);
        ctx.drawImage(
            beeperSticker,
            -scaledWidth/2,
            -scaledHeight/2,
            scaledWidth,
            scaledHeight
        );
        ctx.restore();

        setTimeout(() => {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'beeper-sticker-image.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 100);
    });

    function resetStickerPosition() {
        beeperSticker.style.transform = 'translate(0px, 0px) rotate(0deg)';
        beeperSticker.dataset.x = 0;
        beeperSticker.dataset.y = 0;
        rotationControl.value = 0;
        sizeControl.value = 100;
        rotationValue.textContent = '0°';
        sizeValue.textContent = '100%';
    }
});
