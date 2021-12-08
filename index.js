
function Bus(id) { // クラスの定義
    var me = this; // インスタンス自身への参照を定義
    this.id = id;
    this.size = 30;
    this.latitude = 36.105030;  //緯度 lat
    this.longitude = 140.101137; //経度 lng
    this.draw = function(ctx, x, y) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.fillStyle = "#ff3";
        ctx.strokeStyle = "#000";
        ctx.moveTo(x-me.size/2, y-me.size/2);
        ctx.lineTo(x+me.size/2, y-me.size/2);
        ctx.lineTo(x+me.size/2, y+me.size/2);
        ctx.lineTo(x-me.size/2, y+me.size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };    
}
var names = ["つくばセンター","吾妻小学校前","筑波大学春日キャンパス","筑波メディカルセンター前","第一エリア前","筑波大学中央"]
var positions = [[50,490],[50,457],[50,423],[50,390],[50,100],[250,120]];

function Stop(id) { // クラスの定義
    var me = this; // インスタンス自身への参照を定義
    var name = names[id]; // インスタンス変数（private）
    var [x, y] = positions[id];
    this.id = id;
    this.size = 10;
    this.latitude = 36.110431;  //緯度 lat
    this.longitude = 140.099017; //経度 lng
    this.draw = function(ctx) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.fillStyle = "#3f3";
        ctx.strokeStyle = "#000";
        ctx.moveTo(x+me.size, y);
        ctx.arc(x, y, me.size, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.stroke();
    };
}

var bus = new Bus();
var stop = new Stop(2);

function calc_distance(bus, stop) {
    var busX = bus.latitude;
    var busY = bus.longitude;
    var stopX = stop.latitude;
    var stopY = stop.longitude;
    var deltaX=110959.0097;
    var deltaY=90163.2924;
    
    return Math.sqrt((deltaX*(busX-stopX))**2 + deltaY*((busY - stopY))**2);
}

var dist = calc_distance(bus, stop);

// document.getElementById("testdis").textContent = dist;

function calc_time(bus, dist) {
    var delta =90163.2924;

}

var timetable = [1633,1700, 1701, 1702, 1703, 1820];  


//現在の時刻から次のバスが到着するまでの時間を計算
function detect_arrival(timetable){
    var now = load_now(); //現在時刻

    var target = 0; //次のバスが来る時刻
    timetable.some(function(element, index){
        console.log(element);
        element = element*100;
        if(element>now){
            target = element;
            console.log('target');
            console.log(target);
            return true;
        }        
    });
    
    var now_hour = Math.floor(now/10000);
    var now_min = Math.floor(now/100) - now_hour*100;
    var now_sec = now - now_hour*10000 - now_min*100;
    var tgt_hour = Math.floor(target/10000);
    var tgt_min = Math.floor(target/100) - tgt_hour*100;
    var tgt_sec = target - tgt_hour*10000 - tgt_min*100;
    var now_time = now_hour*3600 + now_min*60 + now_sec; //現在時刻を秒で表現

    var tgt_time = tgt_hour*3600 + tgt_min*60 + tgt_sec; //到着時刻を秒で表現
    
    var arrival = tgt_time - now_time;
    console.log('tgt_time');
    console.log(tgt_time);
    console.log('now_time');
    console.log(now_time);
    var arrival_min = Math.floor(arrival/60);
    var arrival_sec = arrival - arrival_min*60;
    return [arrival_min, arrival_sec];
}

var [arrival_min,arrival_sec] = detect_arrival(timetable); //次のバスが到着するまでの時間
console.log(arrival_min);
console.log(arrival_sec);
function load_now(){
    var now = new Date();
    var hour = now.getHours();
    var min = now.getMinutes();
    var sec = now.getSeconds();
    var time = hour*10000+min*100+sec;  //秒の仕様を後で確認する。
    return time;
}
// document.getElementById("arrival").textContent = arrival_min + "分" + arrival_sec + "秒"; 
//document.getElementById("arrival").textContent = "テスト"
// document.getElementById("helloworld").textContent = arrival_min + "分" + arrival_sec + "秒";
document.getElementById("arrival").textContent = arrival_min + "分" + arrival_sec + "秒";


var cvs = document.createElement("canvas");
cvs.width = 500;
cvs.height = 500;
document.getElementById("container").appendChild(cvs);
var ctx = cvs.getContext("2d");

var num_bus = 2;
var num_stop = 6;
var timetable_start = [1630, 1640, 1650, 1700, 1710, 1720]; //中央
var timetable_end = [1635, 1645, 1655, 1705, 1715, 1725]; //第一

function cals_pos(i) {
    var now = load_now();
    var targets_start = []; //次のバスが来る時刻
    timetable_end.forEach(function(element){
        element = element*100;
        if(element>now){
            targets_end.push(element);
        }        
    });
    var target_end = targets_end[i];
    var targets_start = [];
    var i = 0;
    timetable_start.forEach(function(element){
        element = element*100;
        if(element>target_end){
            targets.push(element);
            i++;
        }   
    });
    var target_start = timetable_start[i-1];
}

function render() {

    ctx.clearRect(0, 0, 500, 500);

    //map
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(50, 490);
    ctx.lineTo(50, 90);
    //ctx.arc(中心座標x, 中心座標y, 半径, 開始角, 終了角, 反時計回りか？); 3時〜12時の位置 ctx.arc(320, 120, 80, 0, 1.5 * Math.PI);
    //開始角は3時の方角で時計回り
    ctx.arc(100, 90, 50, Math.PI, 3*Math.PI/2, false);
    ctx.lineTo(200, 40);
    ctx.arc(200, 90, 50, 3*Math.PI/2, 0, false);
    ctx.lineTo(250, 340);
    ctx.arc(200, 340, 50, 0, Math.PI/2, false);
    ctx.lineTo(50, 390);
    ctx.stroke();

    for (var i=0; i<num_stop; i++){
        var bstop = new Stop(i);
        bstop.draw(ctx);
    }
    
    for (var i=0; i < num_bus; i++){
        var bus = new Bus(i);
        var [x, y] = calc_pos(i);
        bus.draw(ctx, x, y);
    }

  
    for (var i = 0; i < numCircles; i++) {
        var circle = circles[i];
  
        circle.x += circle.vx;
        circle.y += circle.vy;
  

        //円を描画
        circle.draw(ctx);
    }
 }
  
 setInterval(render, 30);