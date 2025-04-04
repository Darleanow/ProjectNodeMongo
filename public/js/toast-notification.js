class ToastNotification {
    constructor() {
      this.container = null;
      this.createContainer();
      this.toastCount = 0;
      this.toastIds = [];
    }

    createContainer() {
      if (document.querySelector('.toast-container')) {
        this.container = document.querySelector('.toast-container');
        return;
      }

      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
      // Create toast element
      const toastId = `toast-${Date.now()}-${this.toastCount++}`;
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.id = toastId;
      this.toastIds.push(toastId);

      // Create content
      const content = document.createElement('div');
      content.className = 'toast-content';
      content.textContent = message;

      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.hide(toastId));

      const progress = document.createElement('div');
      progress.className = 'toast-progress';

      const progressBar = document.createElement('div');
      progressBar.className = 'toast-progress-bar';
      switch(type) {
        case 'success':
          progressBar.style.backgroundColor = 'var(--success)';
          break;
        case 'error':
          progressBar.style.backgroundColor = 'var(--error)';
          break;
        case 'warning':
          progressBar.style.backgroundColor = '#f59e0b';
          break;
        case 'info':
        default:
          progressBar.style.backgroundColor = 'var(--primary)';
          break;
      }
      progress.appendChild(progressBar);

      toast.appendChild(content);
      toast.appendChild(closeBtn);
      toast.appendChild(progress);

      this.container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      if (duration > 0) {
        progressBar.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 10);

        setTimeout(() => {
          this.hide(toastId);
        }, duration);
      }

      return toastId;
    }

    success(message, duration = 5000) {
      return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
      return this.show(message, 'error', duration);
    }

    info(message, duration = 5000) {
      return this.show(message, 'info', duration);
    }

    warning(message, duration = 5000) {
      return this.show(message, 'warning', duration);
    }

    hide(id) {
      const toast = document.getElementById(id);
      if (!toast) return;

      toast.classList.remove('show');
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';

      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toastIds = this.toastIds.filter(toastId => toastId !== id);
      }, 300);
    }

    hideAll() {
      [...this.toastIds].forEach(id => this.hide(id));
    }
  }

  window.toast = new ToastNotification();

  window.originalAlert = window.alert;
  window.alert = function (message) {
    window.toast.info(message)
  }