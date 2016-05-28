package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's contest pages.
 */
@Singleton
class ContestController @Inject() extends HomeController {

    /**
     * Contest pages
     */
    def contest(cid: String) = Action {
        Ok(views.html.contest(cid, getContestName, getContestUrl, getFirebaseappContest))
    }

    def choose(cid: String, eid: String) = Action {
        Ok(views.html.contestchoose(cid, eid, getContestName, getContestUrl, getFirebaseappContest))
    }

    def form(cid: String, eid: String) = Action {
        Ok(views.html.contestform(cid, eid, getContestName, getContestUrl, getFirebaseappContest))
    }

    def timer(cid: String, eid: String) = Action {
        Ok(views.html.timer(cid, eid, getContestName, getContestUrl, getFirebaseappContest))
    }

    def confirm(cid: String, eid: String) = Action {
        val cubes = Cube.getAll
        val puzzleCategories = PuzzleCategory.getAll
        val puzzleBrands = PuzzleBrand.getAll

        // TODO: Scalaぽい書き方に直したい
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

        Ok(views.html.contestconfirm(cid, eid, getContestName, getContestUrl, getFirebaseappContest, puzzles, puzzleCategories, puzzleBrands))
        //Ok(views.html.contestconfirm(cid, eid, getContestName, getContestUrl, getFirebaseappContest, cubes, puzzles, puzzleCategories, puzzleBrands))
    }
}
