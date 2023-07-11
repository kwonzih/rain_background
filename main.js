const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d')

//min, max 리턴
const randomBetween = (min,max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const THUNDER_RATE = 0.007
let Total
let rains = []
let drops = []
let thunder
let mouse = { x: 0, y: 0, isActive : false} // 초기화

/**빗방울 클래스 */
class Rain {
    constructor(x,y, velocity){
        this.x = x
        this.y = y
        this.velocity=velocity
    }

    draw(){
        const {x,y,velocity} = this
        ctx.beginPath()//라인으로 그리겠다고 선언
        ctx.moveTo(x,y)//시작점
        ctx.lineTo(x + (velocity.x) * 2, y + (velocity.y) * 2) //끝점, 비의 길이
        ctx.strokeStyle = '#8899a6'
        ctx.lineWidth = 1.5
        ctx.stroke()
    }

    splash(){
        for(let i = 0; i < 3; i++){
            const velocity = {
                x: -this.velocity.x + randomBetween(-2,2),
                y: -this.velocity.y + randomBetween(5,10)
            }
            drops.push(new Drop(this.x, innerHeight, velocity ))
        }
    }

    animate() {
        if(this.y > innerHeight){
            this.splash()
            this.x = randomBetween(-innerWidth * 0.2, innerWidth * 1.4)
            this.y = -20
        }
        this.velocity.x = mouse.isActive
            ? randomBetween(-1, 1) + (-innerWidth/2 + mouse.x) / 150
            : randomBetween(-1, 1)
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }
}
/**Thunder 클래스 */
class Thunder {
    constructor(){
        this.opacity = 0
    }

    draw(){
        const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight)
        gradient.addColorStop(0, `rgba(66,84,99, ${this.opacity})`)
        gradient.addColorStop(1, `rgba(18,23,27, ${this.opacity})`)
        ctx.fillStyle = gradient
        ctx.fillRect(0,0,innerWidth, innerHeight) //전체 배경색
    }
    animate(){
        if (this.opacity < 0) return
        this.opacity -= 0.005
        this.draw()
    }
}

/**Drop 클래스*/
class Drop {
    constructor(x,y,velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
        this.gravity = 1.5
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = '#8899a6'
        ctx.fill()
    }

    animate(){
        this.velocity.y += this.gravity
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }
}



/**초기화 작업 */
function init(){
    canvas.width = innerWidth
    canvas.height = innerHeight

    //화면 크기따라 일정한 갯수
    Total = Math.floor(innerWidth * innerHeight / 15000)     
    rains = []
    drops = []
    thunder = new Thunder()

    for (let i = 0; i < Total; i++){
        //x,y 랜덤생성
        const x = randomBetween(0,innerWidth)
        const y = randomBetween(0,innerHeight)
        const velocity = { //각각 떨어지는 속도 다르게
            x: randomBetween(-1,1),
            y: randomBetween(13,18)
        } 
        rains.push(new Rain(x,y,velocity))
    }
}

/**렌더 함수 */
function render(){
    ctx.clearRect(0,0, canvas.width, canvas.height) //지우기
    if(Math.random()< THUNDER_RATE) thunder.opacity = 1
    thunder.animate()
    rains.forEach(rain => rain.animate()) //그리기 
    drops.forEach((drop,index) => {
        drop.animate()
        if (drop.y > innerHeight) drops.splice(index,1)
    })
    window.requestAnimationFrame(render)
}

/**resize 이벤트 */
window.addEventListener('resize', ()=>init())

/**mouse 이벤트 */
canvas. addEventListener('mouseenter', () => mouse.isActive = true)
canvas. addEventListener('mouseleave', () => mouse.isActive = false)
canvas.addEventListener('mousemove', e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})

/**날씨 API 로 정보 데이터 가져오기 */
function getWeatherData(){
    const lat = 35.82786144708566
    const lon = 128.61763385181158
    const appKey = '86d3668654d9ef416d45c04ccf550643'
    const data = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appKey}`)
    return data
}

/**QLDHSMS SKFAKS ZOSQJTMDP RMFUWNRL */
getWeatherData().then(result => {
    const currentWeather = result.data.weather[0].main
    console.log(currentWeather)
    const rainingStatus = ['Rain','Thunderstorm','Drizzle','Clear','Clouds']
    if (rainingStatus.includes(currentWeather)){
        init()
        render() 
    }
})
