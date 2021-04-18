import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from './recipe.actions';
import { Recipe } from '../recipe.model';

@Injectable()
export class RecipesEffects {
  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() =>
      this.http.get<Recipe[]>(
        'https://ng-recipebook-4b6de-default-rtdb.firebaseio.com/recipes.json'
      )
    ),
    map((recipes) =>
      recipes.map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients || [],
      }))
    ),
    map((recipes) => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({ dispatch: false })
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipesState]) =>
      this.http.put(
        'https://ng-recipebook-4b6de-default-rtdb.firebaseio.com/recipes.json',
        recipesState.recipes
      )
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}
}
