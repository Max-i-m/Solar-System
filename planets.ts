class SolarSystem{
    private centerBody: SpaceBody; 
    private width: number = 10000;
    private height: number = 10000;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scale: number = 0.075;
    private viewportX: number;
    private viewportY: number;
    private pressedButton: string = "";
    private questionCounter: number = 1;
    private questionCount: number = 20;
    public pause: boolean = false;

    constructor(){
        this.canvas = <HTMLCanvasElement> document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d")!;

        this.viewportX = this.width / 2;
        this.viewportY = this.height / 2;

        this.updateQuizHeader();

        // Make solar system model
        let sun = new SpaceBody("Sun", 750, 0, 0, "images/sun.png", 0xFFEE00, this);
        let earth = new SpaceBody("Earth", 250, 2300, 365.2, "images/earth.png", 0x7788AA, this);

        // Add moon to its parent (the Earth)
        earth.add([new SpaceBody("Moon", 100, 450, 27, "images/moon.png", 0xCCCCCC, this)]);

        this.centerBody = sun;
       
        // Add planets to their parent (the Sun)
        sun.add([
            new SpaceBody("Mercury", 150, 1000, 88, "images/mercury.png", 0x999999, this),
            new SpaceBody("Venus", 250, 1500, 225, "images/venus.png", 0xBB9999, this),
            earth,
            new SpaceBody("Mars", 200, 3300, 687, "images/mars.png", 0xEE7777, this),
            new SpaceBody("Jupiter", 450, 4500, 4331, "images/jupiter.png", 0x886666, this),
            new SpaceBody("Saturn", 700, 6000, 10747, "images/saturn.png", 0x887777, this),
            new SpaceBody("Uranus", 300, 7500, 30589, "images/uranus.png", 0x4455EE, this),
            new SpaceBody("Neptune", 315, 8500, 59800, "images/neptune.png", 0x5555FF, this),
            new SpaceBody("Pluto", 50, 9500, 90560, "images/pluto.png", 0xBBBBBB, this)
        ]);      

        // Listen to the keyboard events
        window.addEventListener("keydown", (e) => {
            if(e.key === "+"){
                this.scale *= 1.01;
            }
            else if(e.key === "-"){
                this.scale /= 1.01;
            }
            else if(e.key === "ArrowRight"){
                this.viewportX -= 100;
            }
            else if(e.key === "ArrowLeft"){
                this.viewportX += 100;
            }
            else if(e.key === "ArrowUp"){
                this.viewportY += 100;
            }
            else if(e.key === "ArrowDown"){
                this.viewportY -= 100;
            }
            else if(e.key === " "){
                this.pause = !this.pause;
            }
        });

        // Listen to button events
        this.addButtonListeners("right");        
        this.addButtonListeners("left");
        this.addButtonListeners("up");
        this.addButtonListeners("down");

        this.addButtonListeners("in");
        this.addButtonListeners("out");
        
        this.canvas.addEventListener("click", () => {
            this.pause = !this.pause;
        });

        document.getElementById("quiz")!.addEventListener("click", () => {
            this.quizVisible = !this.quizVisible;
        });

        document.getElementById("next")!.addEventListener("click", () => {
            document.getElementById("q" + this.questionCounter)!.className = "hidden";

            if(this.questionCounter === this.questionCount){
                this.questionCounter = 0;
            }

            this.questionCounter++;

            document.getElementById("q" + this.questionCounter)!.className = "";

            this.updateQuizHeader();
        });

        window.addEventListener("wheel", (ev) => {
            ev.preventDefault();
            this.scale *= 1 + ev.deltaY * 5 / 10000;
        });

        // Resize canvas first time
        this.resize();
        window.addEventListener("resize", () => {this.resize()});
    }

    get quizVisible(): boolean{
        return document.getElementById("quizPanel")!.className === "";
    }

    set quizVisible(value: boolean){
        document.getElementById("quizPanel")!.className = value ? "" : "hidden";
    }

    updateQuizHeader(): void{
        document.getElementById("quizHeader")!.innerText = "Question " + this.questionCounter + " of " + this.questionCount;
    }

    addButtonListeners(buttonId: string): void{
        let button = document.getElementById(buttonId)!;
        button.addEventListener("pointerdown", () => {
            this.pressedButton = buttonId;
        });

        let fn = () => {
            this.pressedButton = "";
        };
        button.addEventListener("pointerup", fn);

        button.addEventListener("pointerleave", fn);
    }

    tick(): void{
        if(this.pressedButton){
            if(this.pressedButton === "right"){
                this.viewportX -= 10;        
            }
            else if(this.pressedButton === "left"){
                this.viewportX += 10;        
            }
            else if(this.pressedButton === "up"){
                this.viewportY += 10;        
            }   
            else if(this.pressedButton === "down"){
                this.viewportY -= 10;        
            }
            else if(this.pressedButton === "in"){
                this.scale *= 1.01;
            }
            else if(this.pressedButton === "out"){
                this.scale /= 1.01;
            }
        }

        this.draw();
    }

    // Strech out canvasses to whole window
    resize(): void{
        let bgCanvas = <HTMLCanvasElement> document.getElementById("bgCanvas");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;

        // When canvas resizes it also clears everything.
        // Need to redraw bgCanvas. Don't need to redraw other canvas as it is redrawn 60 times a second.
        this.drawStars(bgCanvas);
    }

    drawStars(bgCanvas: HTMLCanvasElement): void{
        let width = bgCanvas.width;
        let height = bgCanvas.height;
        let bgCtx = bgCanvas.getContext("2d")!;

        bgCtx.fillStyle = "black";
        bgCtx.fillRect(0, 0, width, height);

        for(let i = 0; i < 2000; i++){
            bgCtx.fillStyle = "#" + Math.floor(Math.random() * 115 + 140).toString(16) 
                + Math.floor(Math.random() * 115 + 140).toString(16) 
                + Math.floor(Math.random() * 115 + 140).toString(16); 

            bgCtx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
    }

    draw(): void{
        this.ctx.save();
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.scale(this.scale, this.scale);

        this.ctx.translate(-(this.viewportX - this.canvas.width / 2 / this.scale), -(this.viewportY - this.canvas.height / 2 / this.scale));

        this.centerBody.draw(this.ctx, this.width / 2, this.height / 2);

        this.ctx.restore();
    }
}

// Represents all space objects (moons, planets, stars, black holes etc)
class SpaceBody{
    private name: string;
    private radius: number;
    private orbit: number;
    private orbitAngle: number;
    private speed: number;
    private picture: HTMLImageElement;
    private color: number;
    private system: SolarSystem;
    private satellites: SpaceBody[] = [];  

    constructor(name: string, radius: number, orbit: number, speed: number, pictureUrl: string, color: number, system: SolarSystem){
        this.name = name;
        this.radius = radius;
        this.orbit = orbit;
        this.orbitAngle = Math.random() * 2 * Math.PI;
        this.speed = speed == 0 ? 0 : 1 / Math.log(speed) * 0.02;

        this.picture = new Image();
        this.picture.src = pictureUrl;

        this.color = color;

        this.system = system;
    }

    // Adds satellites to the parent body
    add(bodies: SpaceBody[]): void{
        for(let body of bodies){
            this.satellites.push(body);
        }
    }

    draw(ctx: CanvasRenderingContext2D, parentX: number, parentY: number){
        ctx.beginPath();
        ctx.arc(parentX, parentY, this.orbit, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "white";

        if(!this.system.pause){
            // Rotates the space body around its parent
            this.orbitAngle += this.speed;
        }
        
        // Calculate the x + y of this body
        let x = Math.cos(this.orbitAngle) * this.orbit + parentX;
        let y = Math.sin(this.orbitAngle) * this.orbit + parentY;

        // If have a picture draw it, otherwise draw circle
        if(this.picture !== null){
            ctx.drawImage(this.picture, x - this.radius, y - this.radius, this.radius * 2, this.radius * 2);
        }
        else{
            ctx.fillStyle = "#" + this.color.toString(16);
            ctx.beginPath();
            ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw satellites around parent
        for(let satellite of this.satellites){
            satellite.draw(ctx, x, y);
        }
    }
}

// Wait until the HTML is loaded
window.addEventListener("DOMContentLoaded", () => {
    let solarSystem = new SolarSystem();
    
    // Will be called by the browser 60 times a second 
    function mainDraw(): void{
        solarSystem.tick();
        window.requestAnimationFrame(mainDraw);
    }

    // Start the animation frame
    mainDraw();
});