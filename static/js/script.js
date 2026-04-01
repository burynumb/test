// DOM元素
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const recognizeBtn = document.getElementById('recognizeBtn');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');
const loadingDiv = document.querySelector('.loading');
const resultContent = document.getElementById('resultContent');
const recognizedText = document.getElementById('recognizedText');
const wordCount = document.getElementById('wordCount');
const errorMessage = document.getElementById('errorMessage');
const copyBtn = document.getElementById('copyBtn');
const ocrTypeSelect = document.getElementById('ocrType');

let selectedFile = null;

// 点击上传区域触发文件选择
uploadBox.addEventListener('click', () => {
    fileInput.click();
});

// 拖拽上传
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
    } else {
        showError('请上传图片文件');
    }
});

// 文件选择事件
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// 处理选中的文件
function handleFileSelect(file) {
    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
        showError('图片大小不能超过5MB');
        return;
    }
    
    selectedFile = file;
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewArea.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // 启用识别按钮
    recognizeBtn.disabled = false;
    
    // 隐藏之前的错误和结果
    errorMessage.style.display = 'none';
    resultContent.style.display = 'none';
}

// 识别按钮点击事件
recognizeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    // 准备上传数据
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('ocr_type', ocrTypeSelect.value);
    
    // 显示加载动画
    loadingDiv.style.display = 'flex';
    resultContent.style.display = 'none';
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // 显示识别结果
            recognizedText.textContent = data.text;
            wordCount.textContent = `共识别 ${data.words_count} 行文字`;
            resultContent.style.display = 'block';
        } else {
            // 显示错误
            showError(data.error || '识别失败，请重试');
        }
    } catch (err) {
        console.error('请求错误:', err);
        showError('网络错误，请检查连接后重试');
    } finally {
        loadingDiv.style.display = 'none';
    }
});

// 复制按钮事件
copyBtn.addEventListener('click', () => {
    const text = recognizedText.textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            // 显示复制成功提示
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ 已复制';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            showError('复制失败，请手动选择文本');
        });
    }
});

// 显示错误信息
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}
