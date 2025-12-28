const posterPresets = {
    wechat: { width: 1080, height: 1920, label: 'WeChat Moments' },
    instagram: { width: 1080, height: 1080, label: 'Instagram Post' },
    twitter: { width: 1200, height: 675, label: 'X (Twitter)' },
    pinterest: { width: 1000, height: 1500, label: 'Pinterest' }
};

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('posterText');
    const sizeSelect = document.getElementById('posterSize');
    const fontSelect = document.getElementById('posterFont');
    const backgroundInput = document.getElementById('posterBackground');
    const backgroundOptions = document.querySelectorAll('.bg-option');
    const customBackground = document.querySelector('.bg-custom');
    const textColorInput = document.getElementById('posterTextColor');
    const autoColorToggle = document.getElementById('posterAutoColor');
    const sizeLabel = document.getElementById('posterSizeLabel');
    const metaSize = document.getElementById('posterMetaSize');
    const metaFont = document.getElementById('posterMetaFont');
    const metaBg = document.getElementById('posterMetaBg');
    const metaText = document.getElementById('posterMetaText');
    const exportBtn = document.getElementById('posterExportBtn');
    const canvas = document.getElementById('posterCanvas');

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');

    const updateMeta = (preset, textColor) => {
        const sizeText = `${preset.width} × ${preset.height}`;
        sizeLabel.textContent = sizeText;
        metaSize.textContent = `${sizeText} px`;
        metaFont.textContent = fontSelect.options[fontSelect.selectedIndex].textContent;
        metaBg.textContent = backgroundInput.value.toUpperCase();
        metaText.textContent = textColor.toUpperCase();
    };

    const getLines = () => {
        const rawLines = textInput.value.split('\n');
        const cleaned = rawLines.map((line) => line.trim()).filter((line) => line.length > 0);
        if (cleaned.length === 0) {
            return ['Your Main Title', 'Supporting subtitle text'];
        }
        return cleaned;
    };

    const getTextColor = (hex) => {
        const normalized = hex.replace('#', '');
        const r = parseInt(normalized.substring(0, 2), 16) / 255;
        const g = parseInt(normalized.substring(2, 4), 16) / 255;
        const b = parseInt(normalized.substring(4, 6), 16) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance > 0.6 ? '#111827' : '#f8fafc';
    };

    const setActiveBackground = (color, source = 'preset') => {
        const normalized = color.toLowerCase();
        let matched = false;
        backgroundOptions.forEach((option) => {
            const isActive = option.dataset.color.toLowerCase() === normalized && source !== 'custom';
            option.classList.toggle('active', isActive);
            if (isActive) {
                matched = true;
            }
        });
        if (customBackground) {
            customBackground.classList.toggle('active', source === 'custom' || !matched);
        }
    };

    const renderPoster = () => {
        const preset = posterPresets[sizeSelect.value];
        canvas.width = preset.width;
        canvas.height = preset.height;

        ctx.fillStyle = backgroundInput.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const lines = getLines();
        const titleLine = lines[0];
        const subtitleLines = lines.slice(1);

        let titleSize = Math.round(canvas.width * 0.08);
        let subtitleSize = Math.round(canvas.width * 0.04);
        const lineGap = Math.round(canvas.width * 0.015);

        const fontFamily = fontSelect.value;
        const maxWidth = canvas.width * 0.9;

        const measureMaxWidth = (tSize, sSize) => {
            let maxLineWidth = 0;
            ctx.font = `700 ${tSize}px ${fontFamily}`;
            maxLineWidth = Math.max(maxLineWidth, ctx.measureText(titleLine).width);
            subtitleLines.forEach((line) => {
                ctx.font = `500 ${sSize}px ${fontFamily}`;
                maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
            });
            return maxLineWidth;
        };

        let widthScale = 1;
        const widest = measureMaxWidth(titleSize, subtitleSize);
        if (widest > maxWidth) {
            widthScale = maxWidth / widest;
        }

        const totalLines = 1 + subtitleLines.length;
        const titleHeight = titleSize * 1.15;
        const subtitleHeight = subtitleLines.length ? subtitleSize * 1.2 * subtitleLines.length : 0;
        const totalHeight = titleHeight + subtitleHeight + lineGap * (totalLines - 1);
        const heightScale = totalHeight > canvas.height * 0.85 ? (canvas.height * 0.85) / totalHeight : 1;

        const scale = Math.min(widthScale, heightScale, 1);
        titleSize = Math.round(titleSize * scale);
        subtitleSize = Math.round(subtitleSize * scale);

        const autoTextColor = getTextColor(backgroundInput.value);
        const textColor = autoColorToggle && autoColorToggle.checked ? autoTextColor : textColorInput.value;
        if (autoColorToggle && autoColorToggle.checked) {
            textColorInput.value = autoTextColor;
            textColorInput.disabled = true;
        } else if (textColorInput) {
            textColorInput.disabled = false;
        }
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const titleHeightScaled = titleSize * 1.15;
        const subtitleHeightScaled = subtitleLines.length ? subtitleSize * 1.2 * subtitleLines.length : 0;
        const totalHeightScaled = titleHeightScaled + subtitleHeightScaled + lineGap * (totalLines - 1);
        let currentY = (canvas.height - totalHeightScaled) / 2;

        ctx.font = `700 ${titleSize}px ${fontFamily}`;
        ctx.fillText(titleLine, canvas.width / 2, currentY);
        currentY += titleHeightScaled + lineGap;

        subtitleLines.forEach((line) => {
            ctx.font = `500 ${subtitleSize}px ${fontFamily}`;
            ctx.fillText(line, canvas.width / 2, currentY);
            currentY += subtitleSize * 1.2 + lineGap;
        });

        updateMeta(preset, textColor);
    };

    const handleChange = () => {
        renderPoster();
    };

    const handleExport = () => {
        const preset = posterPresets[sizeSelect.value];
        const link = document.createElement('a');
        link.download = `poster-${preset.width}x${preset.height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const attachFAQToggle = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;
        faqItems.forEach((item) => {
            const question = item.querySelector('.faq-question');
            if (!question) return;
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach((otherItem) => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active', !isActive);
            });
        });
    };

    textInput.addEventListener('input', handleChange);
    sizeSelect.addEventListener('change', handleChange);
    fontSelect.addEventListener('change', handleChange);
    backgroundOptions.forEach((option) => {
        option.addEventListener('click', () => {
            const selectedColor = option.dataset.color;
            if (backgroundInput && selectedColor) {
                backgroundInput.value = selectedColor;
                setActiveBackground(selectedColor);
                handleChange();
            }
        });
    });
    backgroundInput.addEventListener('input', () => {
        setActiveBackground(backgroundInput.value, 'custom');
        handleChange();
    });
    if (textColorInput) {
        textColorInput.addEventListener('input', handleChange);
    }
    if (autoColorToggle) {
        autoColorToggle.addEventListener('change', handleChange);
    }
    exportBtn.addEventListener('click', handleExport);

    if (backgroundInput) {
        setActiveBackground(backgroundInput.value);
    }
    document.fonts.ready.then(renderPoster);
    attachFAQToggle();
    renderPoster();
});
