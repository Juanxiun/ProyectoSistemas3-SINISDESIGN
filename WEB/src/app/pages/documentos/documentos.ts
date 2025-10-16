import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


import { Navbar } from '../../components/navbar/navbar';
import { Siderbar } from '../../components/siderbar/siderbar';
import { Footer } from '../../components/footer/footer';

//crud
import { DocInfo } from '../../components/doc-info/doc-info';

@Component({
    selector: 'app-documentos-crud-page',
    standalone: true,
    imports: [CommonModule, Navbar, Siderbar, DocInfo],
    templateUrl: "./documentos.html",
    styleUrl: './documentos.css'
})
export class DocumentosCrudPage implements OnInit {
    private route = inject(ActivatedRoute);
    faseId: string | null = null;

    ngOnInit() {

        this.route.paramMap.subscribe(params => {
            this.faseId = params.get('faseId');
            if (this.faseId) {
                console.log(`Cargando documentos para Fase ID: ${this.faseId}`);
            }
        });
    }
}