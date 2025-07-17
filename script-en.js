// DOM Elements
const textInput = document.getElementById('textInput');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamily = document.getElementById('fontFamily');
const textColor = document.getElementById('textColor');
const backgroundColor = document.getElementById('backgroundColor');
const generateBtn = document.getElementById('generateBtn');
const imagePreview = document.getElementById('imagePreview');
const downloadSection = document.getElementById('downloadSection');
const imageFormat = document.getElementById('imageFormat');
const imageQuality = document.getElementById('imageQuality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize controls
    updateFontSizeDisplay();
    updateQualityDisplay();
    
    // Add smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Add scroll effects
    setupScrollEffects();
}

function setupEventListeners() {
    // Text input events
    textInput.addEventListener('input', handleTextInput);
    
    // Control events
    fontSize.addEventListener('input', updateFontSizeDisplay);
    imageQuality.addEventListener('input', updateQualityDisplay);
    
    // Button events
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);
    
    // Navigation events
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Real-time preview
    [fontSize, fontFamily, textColor, backgroundColor].forEach(control => {
        control.addEventListener('change', updatePreview);
    });
}

function setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupScrollEffects() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

function handleNavClick(e) {
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to clicked link
    e.target.classList.add('active');
}

function handleTextInput() {
    // Enable/disable generate button based on text input
    if (textInput.value.trim()) {
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
    } else {
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.6';
    }
}

function updateFontSizeDisplay() {
    fontSizeValue.textContent = `${fontSize.value}px`;
    updatePreview();
}

function updateQualityDisplay() {
    const quality = Math.round(imageQuality.value * 100);
    qualityValue.textContent = `${quality}%`;
}

function updatePreview() {
    if (textInput.value.trim()) {
        // Create a temporary preview without generating full image
        const previewText = textInput.value;
        const previewDiv = document.createElement('div');
        previewDiv.style.cssText = `
            font-family: ${fontFamily.value};
            font-size: ${fontSize.value}px;
            color: ${textColor.value};
            background-color: ${backgroundColor.value};
            padding: 30px;
            border-radius: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 100%;
            line-height: 1.6;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            letter-spacing: 0.5px;
        `;
        previewDiv.textContent = previewText;
        
        // Show preview in a subtle way
        imagePreview.innerHTML = '';
        imagePreview.appendChild(previewDiv);
        imagePreview.classList.add('has-image');
    }
}

function generateImage() {
    const text = textInput.value.trim();
    
    if (!text) {
        showNotification('Please enter text to convert', 'error');
        return;
    }
    
    // Show loading state
    generateBtn.innerHTML = '<span class="loading"></span> Generating...';
    generateBtn.disabled = true;
    
    // Simulate processing time for better UX
    setTimeout(() => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size with higher resolution for better quality
            const scale = 2; // 2x resolution for crisp text
            canvas.width = 800 * scale;
            canvas.height = 600 * scale;
            
            // Scale the context to match the resolution
            ctx.scale(scale, scale);
            
            // Set background
            ctx.fillStyle = backgroundColor.value;
            ctx.fillRect(0, 0, 800, 600);
            
            // Configure text with better rendering
            const fontSize = parseInt(document.getElementById('fontSize').value);
            ctx.font = `${fontSize}px ${fontFamily.value}`;
            ctx.fillStyle = textColor.value;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Enable text rendering optimizations
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Add subtle text shadow for better readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // 优化的自动换行处理
            const maxWidth = 700; // 留出更多边距
            const lines = [];
            const rawLines = text.split('\n');
            
            for (let rawLine of rawLines) {
                if (rawLine.trim() === '') {
                    // 保留空行
                    lines.push('');
                    continue;
                }
                
                let currentLine = '';
                
                // 按字符处理，支持中英文混合
                for (let i = 0; i < rawLine.length; i++) {
                    const char = rawLine[i];
                    const testLine = currentLine + char;
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && currentLine !== '') {
                        // 当前行已满，换行
                        lines.push(currentLine);
                        currentLine = char;
                    } else {
                        currentLine = testLine;
                    }
                }
                
                // 添加最后一行
                if (currentLine !== '') {
                    lines.push(currentLine);
                }
            }
            
            // 计算文本总高度和行间距
            const lineHeight = fontSize * 1.6; // 更舒适的行间距
            const totalHeight = lines.length * lineHeight;
            const startY = Math.max(120, (600 - totalHeight) / 2); // 确保最小上边距
            
            // 绘制文本
            lines.forEach((line, index) => {
                const y = startY + (index * lineHeight) + (lineHeight / 2);
                
                // 空行不绘制
                if (line.trim() !== '') {
                    // 绘制主文本
                    ctx.fillText(line, 400, y);
                    
                    // 可选：添加描边效果（如果背景色较浅）
                    const bgColor = backgroundColor.value;
                    const isLightBackground = isLightColor(bgColor);
                    
                    if (isLightBackground) {
                        // 为浅色背景添加描边
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                        ctx.lineWidth = 0.5;
                        ctx.strokeText(line, 400, y);
                    }
                }
            });
            
            // Convert canvas to image with high quality
            const imageUrl = canvas.toDataURL('image/png', 1.0);
            
            // Display the image
            displayGeneratedImage(imageUrl);
            
            // Show success message
            showNotification('Image generated successfully!', 'success');
            
            // Add success animation
            imagePreview.classList.add('success-animation');
            setTimeout(() => {
                imagePreview.classList.remove('success-animation');
            }, 600);
            
        } catch (error) {
            console.error('Error generating image:', error);
            showNotification('Error generating image, please try again', 'error');
        } finally {
            // Reset button state
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Image';
            generateBtn.disabled = false;
        }
    }, 1000);
}

// 辅助函数：判断是否为浅色
function isLightColor(color) {
    // 将颜色转换为RGB值
    let r, g, b;
    
    if (color.startsWith('#')) {
        // 处理十六进制颜色
        const hex = color.slice(1);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (color.startsWith('rgb')) {
        // 处理RGB颜色
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        }
    } else {
        // 默认返回true（假设为浅色）
        return true;
    }
    
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
}

function displayGeneratedImage(imageUrl) {
    // Clear previous content
    imagePreview.innerHTML = '';
    
    // Create and display the image
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Generated text image';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    
    imagePreview.appendChild(img);
    imagePreview.classList.add('has-image');
    
    // Show download section
    downloadSection.style.display = 'block';
    
    // Store the image URL for download
    imagePreview.dataset.imageUrl = imageUrl;
}

function downloadImage() {
    const imageUrl = imagePreview.dataset.imageUrl;
    
    if (!imageUrl) {
        showNotification('No image available for download', 'error');
        return;
    }
    
    try {
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = `text-to-image-${Date.now()}.${imageFormat.value}`;
        
        // Convert image to selected format and quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Convert to selected format
            let mimeType;
            switch (imageFormat.value) {
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                default:
                    mimeType = 'image/png';
            }
            
            const dataUrl = canvas.toDataURL(mimeType, imageQuality.value);
            link.href = dataUrl;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Image downloaded successfully!', 'success');
        };
        
        img.src = imageUrl;
        
    } catch (error) {
        console.error('Error downloading image:', error);
        showNotification('Error downloading image, please try again', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add CSS animations
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#6366f1';
    }
}

// Scroll functions for navigation
function scrollToConverter() {
    document.getElementById('converter').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate image
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!generateBtn.disabled) {
            generateImage();
        }
    }
    
    // Ctrl/Cmd + S to download image
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (downloadSection.style.display !== 'none') {
            downloadImage();
        }
    }
});

// Add some sample text for demonstration
window.addEventListener('load', function() {
    // Add sample text after a short delay
    setTimeout(() => {
        if (!textInput.value) {
            textInput.value = 'Welcome to Text to Image Converter!\n\nEnter your text here, choose fonts, colors, and backgrounds, then click the generate button to create beautiful images.\n\nSupport multiple formats for download, completely free to use!';
            handleTextInput();
        }
    }, 2000);
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}); 