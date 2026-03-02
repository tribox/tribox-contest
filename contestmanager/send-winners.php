<?php

/**
 * 入賞ポイント進呈通知メールを送る
 *
 * Usage:
 *   php send-winners.php foo@tribox.jp "名前" "シーズン名" "(種目名_順位_ポイント)ハイフン区切り" ポイント数
 */

if (count($argv) != 6) {
    exit("Invalid arguments\n");
}

date_default_timezone_set('Asia/Tokyo');
mb_language('ja');
mb_internal_encoding('UTF-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once('PHPMailer/src/Exception.php');
require_once('PHPMailer/src/PHPMailer.php');
require_once('PHPMailer/src/SMTP.php');

require_once('send-email-config.php');

// Prepare email contents
$to_email = $argv[1];
$to_name = $argv[2];
$season = $argv[3];
$events_name = $argv[4];
$point = $argv[5];

$seasonstr = substr($season, 0, 4) . '年';
if (substr($season, 4, 1) === '1') {
    $seasonstr .= '前半期';
} else if (substr($season, 4, 1) === '2') {
    $seasonstr .= '後半期';
}

$winnerslist = str_replace('+', "\n", $events_name);
$winnerslist = str_replace('_', ' ', $winnerslist);

$subject = '[' . MY_EMAIL_CONTEST_NAME . '] 入賞賞金 (TORIBOポイント) 進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . "トリボコンテストにご参加頂き、誠にありがとうございます。\n"
      . $seasonstr . "のシーズンランキング入賞者のみなさまに、入賞賞金 (TORIBOポイント) についてお知らせ致します。\n\n"
      . $winnerslist . "\n"
      . "合計進呈ポイント: " . $point . "\n\n"
      . "https://contest.tribox.com/ranking/" . $season . "\n\n"
      . "おめでとうございます！\n"
      . "TORIBOポイントは、みなさまのTORIBOストアアカウントに既に付与されています。\n"
      . "最新のパズル購入などにご利用ください。\n\n"
      . "今シーズンもぜひよろしくお願い致します。\n"
      . "https://contest.tribox.com/\n"
      . "株式会社トライボックス\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = MY_EMAIL_HOST;
$mailer->Port = MY_EMAIL_PORT;

$mailer->setFrom(MY_EMAIL_FROM_ADDRESS, mb_encode_mimeheader(MY_EMAIL_FROM_NAME));
$mailer->addAddress($to_email);
$mailer->addReplyTo(MY_EMAIL_FROM_ADDRESS);
$mailer->addCC(MY_EMAIL_FROM_ADDRESS);

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mailer->ErrorInfo . "\n";
} else {
    echo 'Message sent!' . "\n";
}
