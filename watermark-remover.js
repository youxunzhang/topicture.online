let watermarkImage = null;
let watermarkSelection = null;
let isDragging = false;
let isMoving = false;
let dragStart = { x: 0, y: 0 };
let selectionOffset = { x: 0, y: 0 };
let outputDataUrl = null;
let activeMode = 'crop';

const state = {
    ratioLocked: false,
    ratioValue: 'free',
    quality: 0.9,
    coverType: 'blur',
    coverColor: '#f8fafc',
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupNavigation();
    setupUpload();
    setupControls();
});

function cacheElements() {
    elements.uploadArea = document.getElementById('watermarkUploadArea');
    elements.imageInput = document.getElementById('watermarkImageInput');
    elements.controls = document.getElementById('watermarkControls');
    elements.canvas = document.getElementById('watermarkCanvas');
    elements.originalSize = document.getElementById('watermarkOriginalSize');
    elements.selectionSize = document.getElementById('watermarkSelectionSize');
    elements.aspectRatio = document.getElementById('watermarkAspectRatio');
    elements.ratioSelect = document.getElementById('watermarkRatioSelect');
    elements.modeButtons = document.querySelectorAll('.toggle-btn');
    elements.coverOptions = document.getElementById('coverOptions');
    elements.coverType = document.getElementById('coverType');
    elements.coverColor = document.getElementById('coverColor');
    elements.quality = document.getElementById('watermarkQuality');
    elements.qualityValue = document.getElementById('watermarkQualityValue');
    elements.format = document.getElementById('watermarkFormat');
    elements.exportBtn = document.getElementById('watermarkExportBtn');
    elements.downloadBtn = document.getElementById('watermarkDownloadBtn');
    elements.clearBtn = document.getElementById('watermarkClearBtn');
    elements.resetBtn = document.getElementById('watermarkResetBtn');
    elements.outputPreview = document.getElementById('watermarkOutputPreview');
    elements.outputImage = document.getElementById('watermarkOutputImage');
    elements.hamburger = document.querySelector('.hamburger');
    elements.navMenu = document.querySelector('.nav-menu');
}

function setupNavigation() {
    if (!elements.hamburger || !elements.navMenu) return;
    elements.hamburger.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
        elements.hamburger.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.navMenu.classList.remove('active');
            elements.hamburger.classList.remove('active');
        });
    });
}

function setupUpload() {
    if (!elements.uploadArea || !elements.imageInput) return;
    elements.uploadArea.addEventListener('click', () => elements.imageInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.imageInput.addEventListener('change', handleFileSelect);
}

function setupControls() {
    elements.canvas.addEventListener('mousedown', handlePointerDown);
    elements.canvas.addEventListener('mousemove', handlePointerMove);
    elements.canvas.addEventListener('mouseup', handlePointerUp);
    elements.canvas.addEventListener('mouseleave', handlePointerUp);

    elements.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.canvas.addEventListener('touchend', handlePointerUp);

    elements.aspectRatio.addEventListener('change', () => {
        state.ratioLocked = elements.aspectRatio.checked;
    });

    elements.ratioSelect.addEventListener('change', () => {
        state.ratioValue = elements.ratioSelect.value;
    });

    elements.modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeMode = button.dataset.mode;
            elements.coverOptions.style.display = activeMode === 'cover' ? 'block' : 'none';
        });
    });

    elements.coverType.addEventListener('change', () => {
        state.coverType = elements.coverType.value;
    });

    elements.coverColor.addEventListener('input', () => {
        state.coverColor = elements.coverColor.value;
    });

    elements.quality.addEventListener('input', () => {
        state.quality = Number(elements.quality.value) / 100;
        elements.qualityValue.textContent = elements.quality.value;
    });

    elements.exportBtn.addEventListener('click', exportImage);
    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.clearBtn.addEventListener('click', clearSelection);
    elements.resetBtn.addEventListener('click', resetAll);
}

function handleDragOver(event) {
    event.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = event => loadImage(event.target.result);
    reader.readAsDataURL(file);
}

function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        watermarkImage = img;
        setupCanvas();
        elements.controls.style.display = 'grid';
        elements.originalSize.textContent = `Original: ${img.width} × ${img.height}px`;
        elements.selectionSize.textContent = 'Selection: --';
        elements.outputPreview.style.display = 'none';
        elements.downloadBtn.disabled = true;
        outputDataUrl = null;
        watermarkSelection = null;
        renderCanvas();
    };
    img.src = src;
}

function setupCanvas() {
    elements.canvas.width = watermarkImage.width;
    elements.canvas.height = watermarkImage.height;
}

function handlePointerDown(event) {
    if (!watermarkImage) return;
    const { x, y } = getCanvasPoint(event);

    if (watermarkSelection && pointInSelection(x, y)) {
        isMoving = true;
        selectionOffset = { x: x - watermarkSelection.x, y: y - watermarkSelection.y };
        return;
    }

    isDragging = true;
    dragStart = { x, y };
    watermarkSelection = { x, y, width: 0, height: 0 };
}

function handlePointerMove(event) {
    if (!watermarkImage) return;

    const { x, y } = getCanvasPoint(event);

    if (isDragging) {
        updateSelectionFromDrag(x, y);
        renderCanvas();
    } else if (isMoving) {
        const newX = clamp(x - selectionOffset.x, 0, watermarkImage.width - watermarkSelection.width);
        const newY = clamp(y - selectionOffset.y, 0, watermarkImage.height - watermarkSelection.height);
        watermarkSelection.x = newX;
        watermarkSelection.y = newY;
        renderCanvas();
    }
}

function handlePointerUp() {
    if (isDragging) {
        finalizeSelection();
    }
    isDragging = false;
    isMoving = false;
}

function handleTouchStart(event) {
    event.preventDefault();
    handlePointerDown(event.touches[0]);
}

function handleTouchMove(event) {
    event.preventDefault();
    handlePointerMove(event.touches[0]);
}

function updateSelectionFromDrag(x, y) {
    let width = x - dragStart.x;
    let height = y - dragStart.y;

    if (state.ratioLocked && state.ratioValue !== 'free') {
        const ratio = getRatioValue();
        if (Math.abs(width) > Math.abs(height)) {
            height = Math.abs(width) / ratio * Math.sign(height || 1);
        } else {
            width = Math.abs(height) * ratio * Math.sign(width || 1);
        }
    }

    watermarkSelection = {
        x: dragStart.x,
        y: dragStart.y,
        width,
        height,
    };
}

function finalizeSelection() {
    if (!watermarkSelection) return;
    const normalized = normalizeSelection(watermarkSelection);
    if (normalized.width < 5 || normalized.height < 5) {
        watermarkSelection = null;
        elements.selectionSize.textContent = 'Selection: --';
        renderCanvas();
        return;
    }
    watermarkSelection = normalized;
    updateSelectionText();
    renderCanvas();
}

function normalizeSelection(selection) {
    const width = Math.abs(selection.width);
    const height = Math.abs(selection.height);
    const x = selection.width < 0 ? selection.x - width : selection.x;
    const y = selection.height < 0 ? selection.y - height : selection.y;

    const clampedX = clamp(x, 0, watermarkImage.width - width);
    const clampedY = clamp(y, 0, watermarkImage.height - height);

    return { x: clampedX, y: clampedY, width, height };
}

function updateSelectionText() {
    if (!watermarkSelection) {
        elements.selectionSize.textContent = 'Selection: --';
        return;
    }
    elements.selectionSize.textContent = `Selection: ${Math.round(watermarkSelection.width)} × ${Math.round(watermarkSelection.height)}px`;
}

function renderCanvas() {
    if (!watermarkImage) return;
    const ctx = elements.canvas.getContext('2d');
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    ctx.drawImage(watermarkImage, 0, 0);

    if (watermarkSelection) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
        ctx.drawImage(
            watermarkImage,
            watermarkSelection.x,
            watermarkSelection.y,
            watermarkSelection.width,
            watermarkSelection.height,
            watermarkSelection.x,
            watermarkSelection.y,
            watermarkSelection.width,
            watermarkSelection.height
        );
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            watermarkSelection.x + 1.5,
            watermarkSelection.y + 1.5,
            watermarkSelection.width - 3,
            watermarkSelection.height - 3
        );
    }
}

function exportImage() {
    if (!watermarkImage || !watermarkSelection) {
        alert('Please draw a selection before exporting.');
        return;
    }

    const format = elements.format.value;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    if (activeMode === 'crop') {
        canvas.width = watermarkSelection.width;
        canvas.height = watermarkSelection.height;
        ctx.drawImage(
            watermarkImage,
            watermarkSelection.x,
            watermarkSelection.y,
            watermarkSelection.width,
            watermarkSelection.height,
            0,
            0,
            watermarkSelection.width,
            watermarkSelection.height
        );
    } else {
        canvas.width = watermarkImage.width;
        canvas.height = watermarkImage.height;
        ctx.drawImage(watermarkImage, 0, 0);
        if (state.coverType === 'blur') {
            ctx.save();
            ctx.filter = 'blur(8px)';
            ctx.drawImage(
                watermarkImage,
                watermarkSelection.x,
                watermarkSelection.y,
                watermarkSelection.width,
                watermarkSelection.height,
                watermarkSelection.x,
                watermarkSelection.y,
                watermarkSelection.width,
                watermarkSelection.height
            );
            ctx.restore();
        } else {
            ctx.fillStyle = state.coverColor;
            ctx.fillRect(
                watermarkSelection.x,
                watermarkSelection.y,
                watermarkSelection.width,
                watermarkSelection.height
            );
        }
    }

    const mimeType = format === 'png' ? 'image/png' : `image/${format}`;
    outputDataUrl = canvas.toDataURL(mimeType, state.quality);
    elements.outputImage.src = outputDataUrl;
    elements.outputPreview.style.display = 'block';
    elements.downloadBtn.disabled = false;
}

function downloadImage() {
    if (!outputDataUrl) return;
    const format = elements.format.value;
    const link = document.createElement('a');
    link.href = outputDataUrl;
    link.download = `watermark-${activeMode}.${format}`;
    link.click();
}

function clearSelection() {
    watermarkSelection = null;
    updateSelectionText();
    renderCanvas();
}

function resetAll() {
    watermarkImage = null;
    watermarkSelection = null;
    outputDataUrl = null;
    elements.controls.style.display = 'none';
    elements.uploadArea.classList.remove('dragover');
    elements.imageInput.value = '';
    elements.outputPreview.style.display = 'none';
    elements.downloadBtn.disabled = true;
}

function pointInSelection(x, y) {
    if (!watermarkSelection) return false;
    return (
        x >= watermarkSelection.x &&
        x <= watermarkSelection.x + watermarkSelection.width &&
        y >= watermarkSelection.y &&
        y <= watermarkSelection.y + watermarkSelection.height
    );
}

function getRatioValue() {
    if (state.ratioValue === 'original' && watermarkImage) {
        return watermarkImage.width / watermarkImage.height;
    }
    if (state.ratioValue === '1:1') return 1;
    if (state.ratioValue === '4:3') return 4 / 3;
    if (state.ratioValue === '16:9') return 16 / 9;
    return 1;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getCanvasPoint(event) {
    const rect = elements.canvas.getBoundingClientRect();
    const scaleX = elements.canvas.width / rect.width;
    const scaleY = elements.canvas.height / rect.height;
    return {
        x: clamp((event.clientX - rect.left) * scaleX, 0, elements.canvas.width),
        y: clamp((event.clientY - rect.top) * scaleY, 0, elements.canvas.height),
    };
}
