import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { routes } from './app.routes';
import { FileNavigatorService } from './services/file-navigator-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('App Routing', () => {
  let router: Router;
  let location: Location;

  beforeEach(() => {
    const fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    fileNavigatorServiceMock.getItems.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter(routes),
        { provide: FileNavigatorService, useValue: fileNavigatorServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    router.initialNavigation();
  });

  it('navigate to "" redirects to ""', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('');
  }));

  it('navigate to "articles" redirects to /articles', fakeAsync(() => {
    router.navigate(['articles']);
    tick();
    expect(location.path()).toBe('/articles');
  }));

  it('navigate to "articles/some-slug" redirects to /articles/some-slug', fakeAsync(() => {
    router.navigate(['articles/some-slug']);
    tick();
    expect(location.path()).toBe('/articles/some-slug');
  }));

  it('navigate to "projects" redirects to /projects', fakeAsync(() => {
    router.navigate(['projects']);
    tick();
    expect(location.path()).toBe('/projects');
  }));

  it('navigate to "projects/the-big-agent" redirects to /projects/the-big-agent', fakeAsync(() => {
    router.navigate(['projects/the-big-agent']);
    tick();
    expect(location.path()).toBe('/projects/the-big-agent');
  }));

  it('navigate to "projects/personal-website" redirects to /projects/personal-website', fakeAsync(() => {
    router.navigate(['projects/personal-website']);
    tick();
    expect(location.path()).toBe('/projects/personal-website');
  }));

  it('navigate to "projects/rpg-roguelite-bullethell" redirects to /projects/rpg-roguelite-bullethell', fakeAsync(() => {
    router.navigate(['projects/rpg-roguelite-bullethell']);
    tick();
    expect(location.path()).toBe('/projects/rpg-roguelite-bullethell');
  }));

  it('navigate to "health" redirects to /health', fakeAsync(() => {
    router.navigate(['health']);
    tick();
    expect(location.path()).toBe('/health');
  }));

  it('navigate to non-existent route stays on same path but renders HomeComponent', fakeAsync(() => {
    router.navigate(['/non-existent']);
    tick();
    expect(location.path()).toBe('/non-existent');
  }));
});
