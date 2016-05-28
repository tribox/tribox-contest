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
class ContestController @Inject() extends Controller {

    /**
     * Contest pages
     */
    def contest(cid: String) = Action {
        val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
        val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
        val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
        Ok(views.html.contest(cid, contestName, contestUrl, firebaseappContest))
    }

    def choose(cid: String, eid: String) = Action {
        val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
        val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
        val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
        Ok(views.html.contestchoose(cid, eid, contestName, contestUrl, firebaseappContest))
    }

    def form(cid: String, eid: String) = Action {
        val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
        val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
        val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
        Ok(views.html.contestform(cid, eid, contestName, contestUrl, firebaseappContest))
    }

    def timer(cid: String, eid: String) = Action {
        val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
        val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
        val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
        Ok(views.html.timer(cid, eid, contestName, contestUrl, firebaseappContest))
    }

    def confirm(cid: String, eid: String) = Action {
        val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
        val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
        val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
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

        Ok(views.html.contestconfirm(cid, eid, contestName, contestUrl, firebaseappContest, puzzles, puzzleCategories, puzzleBrands))
        //Ok(views.html.contestconfirm(cid, eid, contestName, contestUrl, firebaseappContest, cubes, puzzles, puzzleCategories, puzzleBrands))
    }
}
