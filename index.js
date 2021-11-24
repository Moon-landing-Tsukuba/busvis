document.getElementById("helloworld").textContent = "helloworld!!!!!!";

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
    var deltaX=110959.0097
    var deltaY=90163.2924
    
    return Math.sqrt((deltaX*(busX-stopX))**2 + deltaY*((busY - stopY))**2);
}

var dist = calc_distance(bus, stop);
document.getElementById("testdis").textContent = dist;

function calc_time(bus, dist) {
    var delta =90163.2924;

}