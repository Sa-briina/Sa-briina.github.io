
document.addEventListener("DOMContentLoaded", () => {
  const config = {
    transitionDuration: 3000, // 3 segundos de transição
    displayTime: 15000, // 15 segundos por imagem
    images: [
      // Seleção automática das imagens definidas no CSS
      ...document.querySelectorAll(".background-image"),
    ].map((img) => {
      return {
        element: img,
        url: window
          .getComputedStyle(img)
          .backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1],
      };
    }),
  };

  if (config.images.length === 0) {
    console.warn("Nenhuma imagem de fundo encontrada");
    return;
  }

  const interactiveBg = createInteractiveBackground();

  let currentIndex = 0;
  let nextIndex = 1;

  config.images[currentIndex].element.classList.add("active");

  function transitionToNext() {
    nextIndex = (currentIndex + 1) % config.images.length;
    const currentImg = config.images[currentIndex].element;
    const nextImg = config.images[nextIndex].element;

    currentImg.classList.remove("active");
    nextImg.classList.add("active");

    currentIndex = nextIndex;

    setTimeout(transitionToNext, config.displayTime);
  }

  setTimeout(transitionToNext, config.displayTime);

  function createInteractiveBackground() {
    const background = document.getElementById("background");

    if (!background) {
      console.error("Elemento #background não encontrado");
      return;
    }

    const maxOffset = 2;
    let animationFrame;
    let lastX = 0;
    let lastY = 0;
    const smoothFactor = 0.15;

    function smoothMove(e) {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const targetX = ((clientX / innerWidth) * 2 - 1) * maxOffset;
      const targetY = ((clientY / innerHeight) * 2 - 1) * maxOffset;

      lastX = lastX + (targetX - lastX) * smoothFactor;
      lastY = lastY + (targetY - lastY) * smoothFactor;

      const activeImages = document.querySelectorAll(
        ".background-image.active"
      );
      activeImages.forEach((img, index) => {
        const depth = 0.3 + index * 0.1;
        img.style.transform = `
            translate3d(
              ${lastX * depth}%, 
              ${lastY * depth}%, 
              0
            )
          `;
      });

      animationFrame = requestAnimationFrame(() => smoothMove(e));
    }

    function handleMouseLeave() {
      const activeImages = document.querySelectorAll(
        ".background-image.active"
      );
      activeImages.forEach((img) => {
        img.style.transform = "translate3d(0, 0, 0)";
      });
    }

    document.addEventListener("mousemove", (e) => {
      cancelAnimationFrame(animationFrame);
      smoothMove(e);
    });

    document.addEventListener("mouseleave", handleMouseLeave);

    return {
      destroy: function () {
        cancelAnimationFrame(animationFrame);
        document.removeEventListener("mousemove", smoothMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      },
    };
  }
});
//em cima é as fotos e o movimento com o mouse -------------------------

// Em baixo é o relogio.---------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const observer = new MutationObserver(updateClockColor);
  observer.observe(document.getElementById("background"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  updateClockColor(); // Atualiza inicialmente
});

function updateClockColor() {
  const activeBg = document.querySelector(".background-image.active");
  if (!activeBg) return;

  const style = getComputedStyle(activeBg);
  const fill = style.getPropertyValue("--clock-fill").trim();
  const stroke = style.getPropertyValue("--clock-stroke").trim();

  document.querySelectorAll(".widget-clock-bg path").forEach((path) => {
    path.style.fill = fill || "#FF9E80"; // Fallback
    path.style.stroke = stroke || "#E65100"; // Fallback
  });
}

class ClockWidget {
  constructor(container, timezone = "America/Sao_Paulo") {
    this.container = container;
    this.timezone = timezone;
    this.updateInterval = null;
    this.update();
    this.start();
  }

  update() {
    const now = new Date();
    const options = {
      timeZone: this.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    // Formata a data e hora
    const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", options);
    const parts = dateTimeFormat.formatToParts(now);

    const timeParts = {};
    parts.forEach((part) => {
      if (part.type !== "literal") {
        timeParts[part.type] = part.value;
      }
    });

    // Calcula o offset UTC
    const tzOffset = -now.getTimezoneOffset() / 60;
    const utcOffsetStr =
      tzOffset >= 0 ? `-${tzOffset}` : `+${Math.abs(tzOffset)}`;

    // Atualiza os ponteiros do relógio
    const hours = parseInt(timeParts.hour) % 12;
    const minutes = parseInt(timeParts.minute);
    const seconds = parseInt(timeParts.second);

    const hourHand = this.container.querySelector(".widget-clock-hour-hand");
    const minuteHand = this.container.querySelector(
      ".widget-clock-minute-hand"
    );
    const secondHand = this.container.querySelector(
      ".widget-clock-second-hand"
    );

    hourHand.style.transform = `rotate(${hours * 30 + minutes * 0.5}deg)`;
    minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
    secondHand.style.transform = `rotate(${seconds * 6}deg)`;

    // Atualiza o texto
    this.container.querySelector(
      ".widget-clock-date-text"
    ).textContent = `${timeParts.day}/${timeParts.month}/${timeParts.year}`;

    this.container.querySelector(".widget-clock-hour").textContent =
      timeParts.hour;
    this.container.querySelector(".widget-clock-minute").textContent =
      timeParts.minute;
    this.container.querySelector(".widget-clock-second").textContent =
      timeParts.second;

    this.container.querySelector(
      ".widget-clock-timezone-utc-offset"
    ).textContent = `/ UTC ${utcOffsetStr}:00`;
  }

  start() {
    this.updateInterval = setInterval(() => this.update(), 1000);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Inicializa o relógio quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  const clockWidgets = document.querySelectorAll(".clock-widget");
  clockWidgets.forEach((widget) => {
    new ClockWidget(widget, "America/Sao_Paulo");
  });
});
// em cima é o relogio.----------------------------

// Em baixo é a cor dos wedgets ----------------------------------------

class ImageThemeManager {
  constructor() {
    this.widgets = document.querySelectorAll(".widget");
    this.backgroundImages = document.querySelectorAll(".background-image");
    this.init();
  }

  init() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          this.updateTheme();
        }
      });
    });

    this.backgroundImages.forEach((img) => {
      observer.observe(img, { attributes: true });
    });

    this.updateTheme();
  }

  updateTheme() {
    const activeImage = document.querySelector(".background-image.active");
    if (!activeImage) return;

    setTimeout(() => {
      this.applyTheme(activeImage);
    }, 300);
  }

  applyTheme(imageElement) {
    // Obtém cores definidas no CSS
    const styles = getComputedStyle(imageElement);
    const primaryColor = styles.getPropertyValue("--bg-theme-primary").trim();
    const textColor = styles.getPropertyValue("--bg-theme-text").trim();

    this.widgets.forEach((widget) => {
      widget.style.setProperty(
        "--md-sys-color-secondary-container",
        primaryColor
      );
      widget.style.setProperty(
        "--md-sys-color-on-secondary-container",
        textColor
      );
      widget.style.setProperty(
        "--md-sys-color-shadow",
        `${primaryColor.replace(")", ", 0.1)").replace("rgb", "rgba")}`
      );
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ImageThemeManager();
});
//-------- cor dos projetos ----------------------------------

class ThemeManager {
  constructor() {
    this.widgetManager = new ComponentThemeManager("widget");
    this.projectManager = new ComponentThemeManager("project");
  }
}

class ComponentThemeManager {
  constructor(type) {
    this.type = type;
    this.components = document.querySelectorAll(`.${type}`);
    this.backgroundImages = document.querySelectorAll(".background-image");
    this.init();
  }

  init() {
    const observer = new MutationObserver(() => this.updateTheme());
    this.backgroundImages.forEach((img) => {
      observer.observe(img, { attributes: true });
    });
    this.updateTheme();
  }

  updateTheme() {
    const activeImage = document.querySelector(".background-image.active");
    if (!activeImage) return;

    setTimeout(() => this.applyTheme(activeImage), 300);
  }

  applyTheme(imageElement) {
    const styles = getComputedStyle(imageElement);
    const primaryColor = styles
      .getPropertyValue(`--${this.type}-theme-primary`)
      .trim();
    const textColor = styles
      .getPropertyValue(`--${this.type}-theme-text`)
      .trim();

    this.components.forEach((component) => {
      component.style.setProperty(
        "--md-sys-color-secondary-container",
        primaryColor
      );
      component.style.setProperty(
        "--md-sys-color-on-secondary-container",
        textColor
      );
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});

//---------- codigo de clicar nos wedts e rodas elas  ----------------------------

document.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const scrollPercent = Math.min(scrollY / window.innerHeight, 1);
  document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);
  document.documentElement.style.setProperty(
    "--scroll-y-percent",
    scrollPercent
  );
  document.documentElement.classList.toggle("scrolled", scrollY > 10);

  const layers = document.querySelectorAll(".background-image");
  layers.forEach((layer) => {
    const baseTransform = layer.dataset.baseTransform || "none";
    layer.style.transform = baseTransform;
  });
});

// Clique na seta para descer até o conteúdo
const downArrow = document.querySelector(".down-arrow-inner");
if (downArrow) {
  downArrow.addEventListener("click", () => {
    const content = document.querySelector(".content");
    if (content) {
      content.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// Adicionando interação 3D para widgets
document.querySelectorAll(".widget").forEach((widget) => {
  widget.addEventListener("mousemove", (e) => {
    const rect = widget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calcula o ângulo baseado na posição do mouse relativa ao centro
    const angleX = ((y - centerY) / centerY) * 10; // 10 graus máximo
    const angleY = ((centerX - x) / centerX) * 10; // 10 graus máximo

    widget.style.setProperty("--x", `${angleX}deg`);
    widget.style.setProperty("--y", `${angleY}deg`);
  });

  widget.addEventListener("mouseleave", () => {
    // Retorna à posição original quando o mouse sai
    widget.style.setProperty("--x", "0deg");
    widget.style.setProperty("--y", "0deg");
  });
});

// aqui é a movi, wets dos projetos------------------------------------

document.querySelectorAll(".project").forEach((project) => {
  project.addEventListener("mousemove", (e) => {
    const rect = project.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calcula o ângulo com sensibilidade reduzida (5 graus máximo)
    const angleX = ((y - centerY) / centerY) * 5;
    const angleY = ((centerX - x) / centerX) * 5;

    project.style.setProperty("--x", `${angleX}deg`);
    project.style.setProperty("--y", `${angleY}deg`);
    project.style.setProperty("--dx", `${angleX}deg`); // Para usar no :active
    project.style.setProperty("--dy", `${angleY}deg`); // Para usar no :active
  });

  project.addEventListener("mouseleave", () => {
    project.style.setProperty("--x", "0deg");
    project.style.setProperty("--y", "0deg");
    project.style.setProperty("--dx", "0deg");
    project.style.setProperty("--dy", "0deg");
  });
});
//----------clique do github--------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Configuração para todos os botões "Seguir"
  const followButtons = document.querySelectorAll(".widget-button");

  followButtons.forEach((button) => {
    if (button.textContent.trim().toLowerCase() === "seguir") {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Identifica qual rede social
        const widget = button.closest("a.weblink-widget");

        if (widget.href.includes("instagram.com")) {
          window.open("https://www.instagram.com/s4yree/", "_blank");
        } else if (widget.href.includes("github.com")) {
          window.open("https://github.com/Sa-briina", "_blank");
        } else if (widget.href.includes("pinterest.com")) {
          window.open("https://br.pinterest.com/s2luvki/", "_blank");
        }
      });

      // Efeitos visuais
      button.style.cursor = "pointer";
      button.addEventListener("mouseenter", function () {
        this.style.opacity = "0.8";
        this.style.transform = "scale(1.05)";

        // Efeito especial para Pinterest
        if (this.closest('a[href*="pinterest.com"]')) {
          this.style.background = "linear-gradient(45deg, #ad081b, #e60023)";
        }
      });

      button.addEventListener("mouseleave", function () {
        this.style.opacity = "1";
        this.style.transform = "scale(1)";

        // Reset para Pinterest
        if (this.closest('a[href*="pinterest.com"]')) {
          this.style.background = "linear-gradient(45deg, #e60023, #ad081b)";
        }
      });
    }
  });
});


//------------------------------------------















