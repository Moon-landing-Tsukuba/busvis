
function Bus() { // クラスの定義
    var me = this; // インスタンス自身への参照を定義
    var name = "ななしさん"; // インスタンス変数（private）
    this.latitude = 36.105030;  //緯度 lat
    this.longitude = 140.101137; //経度 lng
    this.velocity = 30; //時速 v
    this.age = 0; // インスタンス変数（public)
    this.setName = function(_name) {
        name = _name; // private変数を外部から修正する
    };
    this.speak = function() { // メソッドの定義
        if (me.age < 2) { // publicインスタンス変数への参照
            alert("「」");
        } else {
            alert("「私の名前は" + name + "、" + me.age + "歳です。」"); // privateインスタンス変数への参照
        }
    };
}
function Stop() { // クラスの定義
    var me = this; // インスタンス自身への参照を定義
    var name = "ななしさん"; // インスタンス変数（private）
    this.latitude = 36.110431;  //緯度 lat
    this.longitude = 140.099017; //経度 lng
    this.age = 0; // インスタンス変数（public)
    this.setName = function(_name) {
        name = _name; // private変数を外部から修正する
    };
    this.speak = function() { // メソッドの定義
        if (me.age < 2) { // publicインスタンス変数への参照
            alert("「」");
        } else {
            alert("「私の名前は" + name + "、" + me.age + "歳です。」"); // privateインスタンス変数への参照
        }
    };
}

var bus = new Bus();
var stop = new Stop();

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

// var cvs = document.createElement("canvas");
// cvs.width = 500;
// cvs.height = 250;
// document.getElementById("container").appendChild(cvs);
// var ctx = cvs.getContext("2d");


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
