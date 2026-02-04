const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

async function startUpload() {
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];
    if (!file) {
        alert("Select a video first");
        return;
    }

    const status = document.getElementById('status');
    const progressBar = document.getElementById('progress');
    const percentDiv = document.getElementById('percent');

    status.textContent = "Preparing...";
    progressBar.value = 0;
    percentDiv.textContent = "0%";

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // 1. Initialize (optional - can be skipped)
    await fetch('/api/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            filename: file.name,
            totalSize: file.size,
            totalChunks: totalChunks
        })
    });

    status.textContent = "Uploading...";

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);
        formData.append('filename', file.name);

        const res = await fetch('/api/upload/chunk', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            status.textContent = "Upload failed!";
            return;
        }

        const data = await res.json();
        const progress = (i + 1) / totalChunks * 100;

        progressBar.value = progress;
        percentDiv.textContent = progress.toFixed(1) + "%";
        status.textContent = `Chunk ${i + 1}/${totalChunks} • ${data.progress}`;
    }

    // 3. Complete
    const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            filename: file.name,
            totalChunks: totalChunks
        })
    });

    const result = await completeRes.json();

    if (result.status === "completed") {
        status.innerHTML = `Done! Video saved as:<br><b>${file.name}</b><br>Location: uploads/`;
    } else {
        status.textContent = "Completion failed: " + result.message;
    }
}