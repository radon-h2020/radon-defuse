import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export interface FaqCategory
{
    id: string;
    title: string;
    faqs?: Faq[];
}

export interface Faq
{
    id: string;
    categoryId: string;
    question: string;
    answer: string;
}


@Component({
    selector     : 'faqs',
    templateUrl  : './faqs.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FaqsComponent implements OnInit
{
    faqCategories: FaqCategory[];

    /**
     * Constructor
     */
    constructor() {

        const faqsGeneralInquiries = [
            {
              id: 'supported-language',
              categoryId: 'general-inquiries',
              question: 'What languages are supported?',
              answer: 'Currently, only the infrastructure code languages Ansible and Tosca are supported. Soon, new ones including applications code languages such as Python will be added.'
            },{
              id: 'supported-learner',
              categoryId: 'general-inquiries',
              question: 'What machine learning algorithms are used to build models?',
              answer: 'For the sake of performance and explainability, Decision Tree is used to build the defect prediction models. Soon, new algorithms will be added along with the possibility of tuning them.'
            }
        ]

        this.faqCategories = [
            {
                id: 'general-inquiries',
                title: 'General inquiries',
                faqs: faqsGeneralInquiries
            }
        ]

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
