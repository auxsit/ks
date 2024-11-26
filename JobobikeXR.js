// Sam design

(function (global) {
    "use strict";
    
    function JobobikeXR(containerId, config) {
        if (!document.getElementById(containerId)) {
            console.error("Container not found: " + containerId);
            return;
        }

        this.containerId = containerId;
        this.folderPath = config.folderPath || "./";
        this.viewPortWidth = config.viewPortWidth || 1200;
        this.viewPortHeight = config.viewPortHeight || 900;
        this.backgroundColor = config.backgroundColor || "#FFFFFF";
        this.uCount = config.uCount || 18;
        this.vCount = config.vCount || 1;
        this.imageExtension = config.imageExtension || "png";
        this.startU = config.startU || 0;
        this.startV = config.startV || 0;
        this.allowFullscreen = config.allowFullscreen || false;

        this.images = [];
        this.currentU = this.startU;
        this.currentV = this.startV;

        this.init();
    }

    JobobikeXR.prototype.init = function () {
        const container = document.getElementById(this.containerId);

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.viewPortWidth;
        this.canvas.height = this.viewPortHeight;
        this.canvas.style.backgroundColor = this.backgroundColor;
        container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");

        this.preloadImages();
        this.addEventListeners();

        // Initial rendering
        this.renderImage();
    };

    JobobikeXR.prototype.preloadImages = function () {
        const totalImages = this.uCount * this.vCount;
        let loadedImages = 0;

        for (let v = 0; v < this.vCount; v++) {
            for (let u = 0; u < this.uCount; u++) {
                const img = new Image();
                img.src = this.getImagePath(u, v);
                img.onload = () => {
                    loadedImages++;
                    if (loadedImages === totalImages) {
                        this.renderImage();
                    }
                };
                this.images.push(img);
            }
        }
    };

    JobobikeXR.prototype.getImagePath = function (u, v) {
        return `${this.folderPath}${v}_${u}.${this.imageExtension}`;
    };

    JobobikeXR.prototype.renderImage = function () {
        const index = this.currentV * this.uCount + this.currentU;
        const img = this.images[index];
        if (img.complete) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            console.log("Image not loaded yet: " + img.src);
        }
    };

    JobobikeXR.prototype.handleDrag = function (deltaX, deltaY) {
        const uChange = Math.round(deltaX / (this.canvas.width / this.uCount));
        const vChange = Math.round(deltaY / (this.canvas.height / this.vCount));

        this.currentU = (this.currentU + uChange + this.uCount) % this.uCount;
        this.currentV = Math.max(0, Math.min(this.vCount - 1, this.currentV + vChange));

        this.renderImage();
    };

    JobobikeXR.prototype.addEventListeners = function () {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.canvas.addEventListener("mousedown", (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;

                this.handleDrag(deltaX, deltaY);

                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            isDragging = false;
        });

        this.canvas.addEventListener("mouseleave", () => {
            isDragging = false;
        });

        if (this.allowFullscreen) {
            this.canvas.addEventListener("dblclick", () => {
                this.canvas.requestFullscreen();
            });
        }
    };

    global.JobobikeXR = JobobikeXR;
})(window);
