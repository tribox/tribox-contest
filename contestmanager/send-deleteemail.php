<?php

/**
 * 記録削除通知メールを送る
 *
 * Usage:
 *   php send-deleteemail.php foo@tribox.jp "名前" "コンテストID" "種目名"
 */

if (count($argv) != 5) {
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

// Prepare email contents
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

$subject = '[TORIBO Contest] 不正記録判断のため記録削除のお知らせ';
$body = $to_name . " 様\n\n"
      . "TORIBO Contest " . $contest_year . " ". $contest_season . " "
      . $contest_num . "節 " . $event_name . "種目 "
      . "におけるあなたの記録が不正と判断されたため、削除されました。\n"
      . "参加者本人が小さなお子様である場合、保護者の皆様にはその監督をお願いいたします。\n\n"
      . "TORIBOコンテスト\n"
      . "https://contest.tribox.com\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = 'localhost';
$mailer->Port = 25;

$mailer->setFrom('support@tribox.jp', mb_encode_mimeheader('TORIBO Contest'));
$mailer->addAddress($to_email);
$mailer->addReplyTo('support@tribox.jp');
$mailer->addCC('support@tribox.jp');

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message sent!';
}
