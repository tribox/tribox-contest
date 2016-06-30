<?php

/**
 * ポイント加算通知メールを送る
 *
 * Usage:
 *   php send-verifyingemail.php foo@tribox.jp "名前" "コンテスト名" "競技名" ポイント数 ポイントタイプ(0/1)
 */

//var_dump($argv);
if (count($argv) != 7) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to_email = $argv[1];
$to_name = $argv[2];
$contest_name = $argv[3];
$event_name = $argv[4];
$point = $argv[5];
$point_type = $argv[6];

$text = "おめでとうございます！\ntriboxコンテストの抽選にて当選されましたので、\nお客様のtriboxストアアカウントにポイントを進呈致しました。\n\n";
if ($point_type == 1) {
    $text = "参加ありがとうございます。\n契約アカウントの皆様に、ポイント進呈のお知らせです。\n\n";
}

$header = 'From:' . mb_encode_mimeheader('tribox Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = '[tribox Contest] ポイント進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . $text
      . "コンテスト名: " . $contest_name . "\n"
      . "競技名: " . $event_name . "\n"
      . "進呈ポイント: " . $point . "\n\n"
      . "triboxストアのマイページよりご確認ください。\n"
      . "https://store.tribox.com/mypage/\n\n"
      . "triboxコンテスト\n"
      . "https://contest.tribox.com\n";
$res = mb_send_mail($to_email, $subject, $body, $header);
