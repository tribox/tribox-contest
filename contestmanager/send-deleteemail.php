<?php

/**
 * 記録削除通知メールを送る
 *
 * Usage:
 *   php send-deleteemail.php foo@tribox.jp "名前" "コンテストID" "種目名"
 */

//var_dump($argv);
if (count($argv) != 5) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to_email = $argv[1];
$to_name = $argv[2];
$contest_id = $argv[3];
$event_name = $argv[4];

$contest_year = substr($contest_id, 0, 4);
$contest_season = '';
if (substr($contest_id, 4, 1) === '1') {
    $contest_season = '前半期';
} else if (substr($contest_id, 4, 1) === '2') {
    $contest_season = '後半期';
}
$contest_num = (string)((int)substr($contest_id, 5, 2));

$header = 'From:' . mb_encode_mimeheader('tribox Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = '[tribox Contest] 不正記録判断のため記録削除のお知らせ';
$body = $to_name . " 様\n\n"
      . "tribox Contest " . $contest_year . " ". $contest_season . " "
      . $contest_num . "節 " . $event_name . "種目 "
      . "におけるあなたの記録が不正と判断されたため、削除されました。\n"
      . "参加者本人が小さなお子様である場合、保護者の皆様にはその監督をお願いいたします。\n\n"
      . "triboxコンテスト\n"
      . "https://contest.tribox.com\n";
$res = mb_send_mail($to_email, $subject, $body, $header);
