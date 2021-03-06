import { FilteredApisHeaderRendererComponent } from './filtered-apis-header-renderer/filtered-apis-header-renderer.component';
import { FilteredApisEntryRendererComponent } from './filtered-apis-entry-renderer/filtered-apis-entry-renderer.component';
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { AbstractKubernetesElementListComponent } from '../../../operation/abstract-kubernetes-element-list.component';
import { HttpClient } from '@angular/common/http';
import { CurrentNamespaceService } from '../../../services/current-namespace.service';
import { ComponentCommunicationService } from '../../../../../shared/services/component-communication.service';
import { AppConfig } from '../../../../../app.config';
import { Filter } from 'app/generic-list';
import { Subscription } from 'rxjs';
import { GraphQLDataProvider } from '../../../operation/graphql-data-provider';
import { ActivatedRoute } from '@angular/router';
import { IEmptyListData } from 'shared/datamodel';
import { GraphQLClientService } from 'shared/services/graphql-client-service';

@Component({
  selector: 'app-filtered-apis',
  templateUrl: 'filtered-apis.component.html'
})
export class FilteredApisComponent
  extends AbstractKubernetesElementListComponent
  implements OnInit, OnDestroy {
  public resourceKind = 'api';
  public emptyListData: IEmptyListData = this.getBasicEmptyListData('APIs', { headerTitle: false, namespaceSuffix: false });
  public createNewElementText = 'Add API';
  public baseUrl: string;
  public currentNamespaceId: string;
  private currentNamespaceSubscription: Subscription;
  public hideFilter = false;
  private serviceName: string;

  constructor(
    private http: HttpClient,
    private currentNamespaceService: CurrentNamespaceService,
    private commService: ComponentCommunicationService,
    private graphQLClientService: GraphQLClientService,
    changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super(currentNamespaceService, changeDetector, http, commService);

    const query = `query API($namespace: String!, $serviceName: String!) {
      apis(namespace: $namespace, serviceName: $serviceName) {
        name
        hostname
        service {
          name
          port
        }
        authenticationPolicies {
          type
          issuer
          jwksURI
        }
      }
    }`;

    this.route.params.subscribe(
      params => {
        this.serviceName = params['name'];
      },
      err => {
        console.log(err);
      }
    );

    this.currentNamespaceSubscription = this.currentNamespaceService
      .getCurrentNamespaceId()
      .subscribe(namespaceId => {
        this.currentNamespaceId = namespaceId;
        this.baseUrl = `${
          AppConfig.k8sApiServerUrl_apimanagement
        }namespaces/${namespaceId}/apis`;

        this.source = new GraphQLDataProvider(
          query,
          {
            namespace: this.currentNamespaceId,
            serviceName: this.serviceName
          },
          this.graphQLClientService
        );
        this.entryRenderer = FilteredApisEntryRendererComponent;
        this.headerRenderer = FilteredApisHeaderRendererComponent;

        this.filterState = {
          filters: [new Filter('name', '', false)]
        };
      });
  }

  public ngOnInit() {
    super.ngOnInit();
    this.subscribeToRefreshComponent();
  }

  public getResourceUrl(kind: string, entry: any): string {
    return `${this.baseUrl}/${entry.name}`;
  }

  public ngOnDestroy() {
    if (this.currentNamespaceSubscription) {
      this.currentNamespaceSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }
}
