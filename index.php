<?php

define('DSN', 'mysql:host=kutnpvrhom7lki7u.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306;dbname=lcgyul56yfcheas3;charset=utf8mb4');
define('DB_USER', 'qniv4bnn438d3vf3');
define('DB_PASS', 'tpcjvhz7crsilp40');

try {
  $pdo = new PDO(
    DSN,
    DB_USER,
    DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]
  );
} catch (PDOException $e) {
  echo $e->getMessage();
  exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
  //ここに日付が変わったらときのUPDATE処理を書く
  
  if(isset($_POST['id']) && isset($_POST['direction'])){
    $user_station =$_POST['id'];
    $direction = $_POST['direction'];

    $sql = "SELECT id, ".$direction." FROM latetimes WHERE id = ".$user_station;
    $stmt = $pdo->query($sql);
    $result = $stmt->fetch();  //PDO::FETCH_ASSOCを指定すれば配列形式で返ってくる。ex) $result['id']のように指定。
    echo("バスの遅延は --> ".$result->$direction." 分です");
    exit;
  }
  if(isset($_POST['fetchid']) && isset($_POST['direct']) && isset($_POST['latetime'])){
    $fetchid = $_POST['fetchid'];
    $direct = $_POST['direct'];
    $receive_time = $_POST['latetime'];

    $stmt = $pdo->query("UPDATE latetimes SET $direct = $receive_time WHERE id = $fetchid");
    $stmt->execute();
  }
}

function getLate($pdo)
{
  $stmt = $pdo->query("SELECT * FROM latetimes ");
  $lates = $stmt->fetchAll();
  return $lates;
}

$lates = getLate($pdo);

?>


<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Busvis</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div id="gps">
            ここにデータを表示
        </div>

        <div class="btn-box">
            <div class="btn switch-left-right on"></div>
            <div class="btn switch-holiday-weekday weekday"></div>
        </div>

        <div class="user-reaction-box">
            <ul>
                <li class="reaction-item" data-late="0">遅れなし</li>
                <li class="reaction-item" data-late="2">2分遅れ</li>
                <li class="reaction-item" data-late="4">4分遅れ</li>
            </ul>
        </div>

        <div id="result">バスの遅延は --> 0 分です</div><!-- このdiv内に整形したデータを非同期で入れる -->

        <!-- <ul>
          <?php foreach ($lates as $late): ?>
            <li>
              <span>
                id : <?= htmlspecialchars($late->id); ?>
                left : <?= htmlspecialchars($late->lefts); ?>
                right : <?= htmlspecialchars($late->rights); ?>
              </span>
            </li>
          <?php endforeach; ?>
        </ul> -->

        <p id="helloworld"></p>
        <p id="testdis"></p>
        <div id="container"></div>
        <div>
            <p id="arrival"></p>
            <p id="nowtime"></p>
        </div>

        <script src="timetable_list.js"></script>
        <script src="index.js"></script>
    </body>
</html>