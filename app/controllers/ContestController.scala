package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's contest pages.
 */
@Singleton
class ContestController @Inject() (
    cc: ControllerComponents,
    configuration: Configuration,
    cubeService: CubeRepository,
    puzzleCategoryService: PuzzleCategoryRepository,
    puzzleBrandService: PuzzleBrandRepository) extends HomeController(cc, configuration) {

    /**
     * Contest pages
     */
    def contestdefault = Action {
        Ok(views.html.contestdefault(getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def contest(cid: String) = Action {
        Ok(views.html.contest(cid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid, getFirebaseappWca))
    }

    def choose(cid: String, eid: String) = Action {
        Ok(views.html.contestchoose(cid, eid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def form(cid: String, eid: String) = Action {
        Ok(views.html.contestform(cid, eid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def timer(cid: String, eid: String) = Action {
        Ok(views.html.contesttimer(cid, eid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def solution(cid: String, eid: String) = Action {
        Ok(views.html.contestsolution(cid, eid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def confirm(cid: String, eid: String) = Action {
        val cubes = cubeService.getAll
        val puzzleBrands = puzzleBrandService.getAll

        // TODO: 以下の処理をScalaぽい書き方に直したい
        var puzzles = List[Puzzle]();
        var prevId = -1;
        var name = "";
        var categoryId = -1;
        var brandId = -1;
        var isFirst = true;
        for (cube:Cube <- cubes) {
            if (!isFirst && prevId != cube.product_id) {
                // データを次のように加工する
                //  - カテゴリIDが未定義なら登録しない
                //  - ブランドIDが未定義なら「その他 (475)」として登録する
                //  - 「3x3x3 DIY Kit (104)」と「3x3x3 その他 (105)」は「3x3x3 (103)」として登録する
                if (categoryId != -1) {
                    if (categoryId == 104 || categoryId == 105) {
                        categoryId = 103;
                    }
                    if (brandId == -1) {
                        brandId = 475;
                    }
                    val p = Puzzle(prevId, name, categoryId, brandId);
                    puzzles :+= p;
                }
                categoryId = -1;
                brandId = -1;
            }
            isFirst = false;
            if (cube.parent_category_id == 1) {
                categoryId = cube.category_id;
            } else if (cube.parent_category_id == 3) {
                brandId = cube.category_id;
            }
            name = cube.name;
            prevId = cube.product_id;
        }
        val p = Puzzle(prevId, name, categoryId, brandId);
        puzzles :+= p;

        // ここで無理やりだがイベントごとにキューブを分類する
        var targetCategory = 103;
        if (eid == "333" || eid == "333bf" || eid == "333oh" || eid == "333fm") {
            targetCategory = 103;
        } else if (eid == "444") {
            targetCategory = 107;
        } else if (eid == "555") {
            targetCategory = 108;
        } else if (eid == "666") {
            targetCategory = 525;
        } else if (eid == "777") {
            targetCategory = 524;
        } else if (eid == "222") {
            targetCategory = 101;
        } else if (eid == "minx") {
            targetCategory = 526;
        } else if (eid == "pyram") {
            targetCategory = 527;
        } else if (eid == "skewb") {
            targetCategory = 528;
        } else if (eid == "sq1") {
            targetCategory = 113;
        } else if (eid == "clock") {
            targetCategory = 544;
        }
        var brandsPuzzles = Map.empty[Int, List[Puzzle]];
        for (puzzle:Puzzle <- puzzles) {
            if (puzzle.categoryId == targetCategory) {
                var l = brandsPuzzles.getOrElse(puzzle.brandId, List[Puzzle]());
                l :+= puzzle;
                brandsPuzzles += puzzle.brandId -> l;
            }
        }

        // ブランドの List を Map へ変換
        var puzzleBrandsMap = Map.empty[Int, String];
        for (puzzleBrand:PuzzleBrand <- puzzleBrands) {
            puzzleBrandsMap += puzzleBrand.category_id -> puzzleBrand.category_name;
        }

        Ok(views.html.contestconfirm(cid, eid,  brandsPuzzles, puzzleBrands, puzzleBrandsMap, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def resultindex(cid: String) = Action {
        Found("/contest/" + cid);
    }

    def result(cid: String, eid: String) = Action {
        Ok(views.html.contestresult(cid, eid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid, getFirebaseappWca))
    }

}
