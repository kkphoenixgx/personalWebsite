import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { Subject, takeUntil } from 'rxjs';

interface ICoverageData {
  total: {
    lines: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  };
}

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss'
})
export class HealthComponent implements OnInit, OnDestroy {
  fps = 0;
  
  covLines = 0;
  covFunctions = 0;
  covBranches = 0;

  public isDarkMode = true;
  private destroy$ = new Subject<void>();

  private animationFrameId: number = 0;
  private frames = 0;
  private prevTime = performance.now();

  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private cdr = inject(ChangeDetectorRef);
  public darkModeService = inject(DarkModeControllerService);

  constructor() {}

  ngOnInit() {
    this.startFpsMonitor();
    this.fetchCoverage();

    this.darkModeService.getDarkModeObserbable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isDarkMode = state;
        this.cdr.markForCheck();
      });

    this.translate.get('HEALTH.TITLE').subscribe(title => {
      this.titleService.setTitle(`${title} | K. Phoenix`);
    });
    this.translate.get('HEALTH.SUBTITLE').subscribe(subtitle => {
      this.metaService.updateTag({ name: 'description', content: subtitle });
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCoverage() {
    this.http.get<ICoverageData>('/assets/coverage.json').subscribe({
      next: (data) => {
        if (data && data.total) {
          this.covLines = data.total.lines.pct || 0;
          this.covFunctions = data.total.functions.pct || 0;
          this.covBranches = data.total.branches.pct || 0;
        }
      },
      error: () => console.warn('Coverage data not found. Run tests with coverage to generate.')
    });
  }

  private startFpsMonitor() {
    const loop = () => {
      this.frames++;
      const time = performance.now();
      if (time >= this.prevTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
        this.frames = 0;
        this.prevTime = time;
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  // --- Helpers SVG Circular Progress (Perímetro de um círculo de raio 40px é ~251.2px) ---
  get fpsOffset(): number {
    const pct = Math.min(this.fps / 60, 1);
    return 251.2 - (251.2 * pct);
  }

  // --- Helpers SVG Test Coverage ---
  get linesOffset(): number {
    return 251.2 - (251.2 * (this.covLines / 100));
  }
  get functionsOffset(): number {
    return 251.2 - (251.2 * (this.covFunctions / 100));
  }
  get branchesOffset(): number {
    return 251.2 - (251.2 * (this.covBranches / 100));
  }
}
