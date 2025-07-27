import { Directive, effect, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../../Core/services/account.service';

@Directive({
  selector: '[appIsAdmin]'
})
export class IsAdminDirective {

  private accountService = inject(AccountService);
  private viewCintainerRef = inject(ViewContainerRef)
  private templateRef = inject(TemplateRef)

  constructor() {
    effect(() => {
      if (this.accountService.isAdmin()) {
        this.viewCintainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewCintainerRef.clear();
      }
    })
  }


}
