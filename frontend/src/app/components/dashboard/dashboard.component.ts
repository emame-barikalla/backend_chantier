import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjetService } from '../../services/projet.service';
import { UserService } from '../../services/user.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalProjects: number = 0;
  totalEnterprises: number = 0;
  totalClients: number = 0;
  totalBudget: number = 0;
  
  projectsIncrease: number = 12;
  enterprisesIncrease: number = 8;
  clientsIncrease: number = 8;
  budgetIncrease: number = 15;
  
  selectedTimeframe: string = 'month';
  
  statusCounts = {
    planifie: 0,
    enCours: 0,
    retarde: 0,
    bloque: 0,
    termine: 0
  };
  
  categoryCounts = {
    medical: 0,
    software: 0,
    residentiel: 0,
    commercial: 0,
    institutionnel: 0,
    autre: 0
  };
  
  recentActivities: any[] = [];
  projectProgressChart: any;
  categoryDistributionChart: any;

  projectsByMonth: { [key: string]: { [key: number]: number } } = {};
  projectsByYear: { [key: string]: number } = {}; // Add property for yearly data

  constructor(
    private projetService: ProjetService,
    private clientService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCharts();
  }

  loadDashboardData(): void {
    // Load projects data
    this.projetService.getAllProjects().subscribe(projects => {
      this.totalProjects = projects.length;
      this.calculateStatusDistribution(projects);
      this.calculateCategoryDistribution(projects);
      this.calculateTotalBudget(projects);
    });

    // Load enterprises data
    this.clientService.getEntreprises().subscribe((enterprises: any[]) => {
      this.totalEnterprises = enterprises.length;
    });

    // Load clients data
    this.clientService.getClients().subscribe(clients => {
      this.totalClients = clients.length;
    });

    // Load projects by month and status
    this.projetService.getProjectsByStatusAndMonth().subscribe(data => {
      this.projectsByMonth = data;
      // Update the project progress chart if it exists
      if (this.projectProgressChart) {
        this.updateProjectProgressChart();
      }
    });

    // Load projects by year and status
    this.projetService.getProjectsByStatusAndYear().subscribe(data => {
      this.projectsByYear = data;
    });
  }

  calculateStatusDistribution(projects: any[]): void {
    // Reset counts
    this.statusCounts = {
      planifie: 0,
      enCours: 0,
      retarde: 0,
      bloque: 0,
      termine: 0
    };

    // Count projects by status
    projects.forEach(project => {
      switch(project.status) {
        case 'PLANIFIE':
          this.statusCounts.planifie++;
          break;
        case 'EN_COURS':
          this.statusCounts.enCours++;
          break;
        case 'RETARDE':
          this.statusCounts.retarde++;
          break;
        case 'BLOQUE':
          this.statusCounts.bloque++;
          break;
        case 'TERMINE':
          this.statusCounts.termine++;
          break;
      }
    });
  }

  calculateCategoryDistribution(projects: any[]): void {
    // Reset counts
    this.categoryCounts = {
      medical: 0,
      software: 0,
      residentiel: 0,
      commercial: 0,
      institutionnel: 0,
      autre: 0
    };

    // Count projects by category
    projects.forEach(project => {
      const category = project.category?.toLowerCase();
      if (this.categoryCounts.hasOwnProperty(category)) {
        this.categoryCounts[category as keyof typeof this.categoryCounts]++;
      } else {
        this.categoryCounts.autre++;
      }
    });

    // Update the category chart if it exists
    if (this.categoryDistributionChart) {
      this.updateCategoryChart();
    }
  }

  calculateTotalBudget(projects: any[]): void {
    this.totalBudget = projects.reduce((sum, project) => {
      return sum + (parseInt(project.budget) || 0);
    }, 0);
  }

  loadCharts(): void {
    setTimeout(() => {
      this.initializeProjectProgressChart();
      this.initializeCategoryDistributionChart();
    }, 500);
  }

  initializeProjectProgressChart(): void {
    const ctx = document.getElementById('projectProgressChart') as HTMLCanvasElement;
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize with empty data, will be updated when real data arrives
    const data = {
      labels: months,
      datasets: [
        {
          label: 'Projets Terminés',
          data: Array(12).fill(0),
          backgroundColor: '#4edd52',
          borderColor: '#4edd52',
          tension: 0.4,
        },
        {
          label: 'Projets en Cours',
          data: Array(12).fill(0),
          backgroundColor: 'rgb(241, 194, 99)',
          borderColor: 'rgb(241, 194, 99)',
          tension: 0.4,
        }
      ]
    };

    this.projectProgressChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
    
    // Update with real data if available
    if (Object.keys(this.projectsByMonth).length > 0) {
      this.updateProjectProgressChart();
    }
  }
  
  updateProjectProgressChart(): void {
    if (!this.projectProgressChart) return;
    
    if (this.selectedTimeframe === 'year') {
      // For yearly view, show status counts in a single period
      this.projectProgressChart.data.labels = ['Année en cours'];
      this.projectProgressChart.data.datasets = [
        {
          label: 'Projets Terminés',
          data: [this.projectsByYear['TERMINE'] || 0],
          backgroundColor: '#4edd52',
          borderColor: '#4edd52',
        },
        {
          label: 'Projets en Cours',
          data: [this.projectsByYear['EN_COURS'] || 0],
          backgroundColor: 'rgb(241, 194, 99)',
          borderColor: 'rgb(241, 194, 99)',
        },
        {
          label: 'Projets Planifiés',
          data: [this.projectsByYear['PLANIFIE'] || 0],
          backgroundColor: '#36a2eb',
          borderColor: '#36a2eb',
        },
        {
          label: 'Projets Retardés',
          data: [this.projectsByYear['RETARDE'] || 0],
          backgroundColor: '#ff6384',
          borderColor: '#ff6384',
        }
      ];
      this.projectProgressChart.options.scales.x = {
        grid: {
          display: false
        }
      };
    } else {
      // For monthly view (default)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const terminatedData = Array(12).fill(0);
      const inProgressData = Array(12).fill(0);
      
      // Fill with real data from projectsByMonth
      if (this.projectsByMonth['TERMINE']) {
        for (let i = 1; i <= 12; i++) {
          terminatedData[i-1] = this.projectsByMonth['TERMINE'][i] || 0;
        }
      }
      
      if (this.projectsByMonth['EN_COURS']) {
        for (let i = 1; i <= 12; i++) {
          inProgressData[i-1] = this.projectsByMonth['EN_COURS'][i] || 0;
        }
      }
      
      this.projectProgressChart.data.labels = months;
      this.projectProgressChart.data.datasets = [
        {
          label: 'Projets Terminés',
          data: terminatedData,
          backgroundColor: '#4edd52',
          borderColor: '#4edd52',
          tension: 0.4,
        },
        {
          label: 'Projets en Cours',
          data: inProgressData,
          backgroundColor: 'rgb(241, 194, 99)',
          borderColor: 'rgb(241, 194, 99)',
          tension: 0.4,
        }
      ];
      this.projectProgressChart.options.scales.x = {
        grid: {
          display: true
        }
      };
    }
    this.projectProgressChart.update();
  }

  initializeCategoryDistributionChart(): void {
    const ctx = document.getElementById('categoryDistributionChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Use real data from categoryCounts
    const data = {
      labels: ['Medical', 'Software', 'Résidentiel', 'Commercial', 'Institutionnel', 'Autre'],
      datasets: [{
        data: [
          this.categoryCounts.medical,
          this.categoryCounts.software,
          this.categoryCounts.residentiel,
          this.categoryCounts.commercial,
          this.categoryCounts.institutionnel,
          this.categoryCounts.autre
        ],
        backgroundColor: [
          '#ff6384',  // Red
          '#36a2eb',  // Blue
          '#4bc0c0',  // Teal
          '#9966ff',  // Purple
          '#ffcd56',  // Yellow
          '#6e6e6e'   // Gray
        ],
        borderWidth: 0
      }]
    };

    this.categoryDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20
            }
          }
        }
      }
    });
  }

  updateCategoryChart(): void {
    if (!this.categoryDistributionChart) return;

    this.categoryDistributionChart.data.datasets[0].data = [
      this.categoryCounts.medical,
      this.categoryCounts.software,
      this.categoryCounts.residentiel,
      this.categoryCounts.commercial,
      this.categoryCounts.institutionnel,
      this.categoryCounts.autre
    ];
    
    this.categoryDistributionChart.update();
  }

  // Add method to handle timeframe selection
  changeTimeframe(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    this.updateProjectProgressChart();
  }

}