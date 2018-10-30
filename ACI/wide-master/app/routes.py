from app import app
from flask import jsonify, request
from scripts.get_org_size_and_comat import *
from scripts.data_handling import *

@app.route('/query/<beginYear>/<endYear>/<keyword>')
def query(beginYear, endYear, keyword):
    #print(beginYear, endYear, keyword)
    bubble = {}
    comat = {}
    df = {}
    for year in range(int(beginYear), int(endYear)+1):
        print(year)
        df[str(year)] = get_entries(year, keyword)
        bubble[str(year)] = get_num_entry_by_org_size_scores(df[str(year)], year)
        comat[str(year)] = get_cooccurrence_matrix(df[str(year)])


    output = {
        "bubble" : bubble,
        "comat" : comat
    }
    return jsonify(output)

@app.route('/query2/<beginYear>/<endYear>/<keyword>')
def query2(beginYear, endYear, keyword):
    for year in range(int(beginYear) , int(endYear)):
        result = get_and_beautify_data_from_api(lookfor=keyword, year=year)
        if result['records'][0]  != 0:
            orgs_count            = count_orgs(result['records'])#for bubble chart
            subjects_count        = count_subjects(result['records'])
            cooccurence_with_keys = count_subjects_presented_together_one_publishcation(result['records'], subjects_count)
            cooc_matrix           = cooccurence_matrix(cooccurence_with_keys)#For heatmap chart

            subject_scores        = subject_scoring(cooc_matrix)
            subject_scores_full   = dict(zip(subjects_count.keys() , subject_scores))
            top_50_subjects       = [[k, subject_scores_full[k]] for k in sorted(subject_scores_full, key=subject_scores_full.get, reverse=True)][:50]
            top_10_orgs           = [[k, orgs_count[k]] for k in sorted(orgs_count, key=orgs_count.get, reverse=True)][:10]

            print("Organizations: {}\nRelated subjects: {}".format(top_10_orgs, top_50_subjects))
        else:
            top_50_subjects  = [0]
            #cooc_matrix = [0]
            top_10_orgs = [0]
            print("No result!!!!!")

        output = {
            "bubble": top_10_orgs,
            "commat": top_50_subjects
        }

        return jsonify(output)


