from finna_client import FinnaClient as fc
from finna_client import FinnaSearchType as fst
import time

def get_and_beautify_data_from_api(lookfor = "EEG", year = "2017") :
    result = fc().search(lookfor=lookfor,
                           search_type=fst.Subject,
                           fields=["buildings", "subjects"],
                           filters=["main_date_str:{year}".format(year = year)],
                           page=1,
                           limit=100)
    b_result = {}
    b_result['resultCount'] = result['resultCount']
    if result['resultCount'] != 0:
        tmp_records = []
        for record in result['records']:
            tmp_record = {}
            tmp_record['building'] = record['buildings'][0]['translated']
            tmp_record['subjects'] = [subject[0] for subject in record['subjects']]
            tmp_records.append(tmp_record)
        b_result['records'] = tmp_records
    else:
        b_result['records'] =[0]
    return b_result

result = get_and_beautify_data_from_api()


def count_orgs(records):
    orgs_count = {}
    for record in records:
        try :
            orgs_count[record['building']] += 1
        except KeyError:
            orgs_count[record['building']]  = 1
    return orgs_count

def count_subjects(records):
    subject_count = {}
    for record in records:
        for subject in record['subjects']:
            subject = subject.lower()
            try:
                subject_count [subject] += 1
            except KeyError:
                subject_count [subject] = 1
    return subject_count

#Return cooccurence matrix with keys (dict type)
def count_subjects_presented_together_one_publishcation(records, subjects_count):
    subjects_presented_together_count = {key: {key:0 for key in subjects_count.keys()} for key in subjects_count.keys() }
    for record in records:
        for subject in record['subjects']:
            for subject_ in record['subjects']:
                subjects_presented_together_count[subject.lower()][subject_.lower()] += 1

    return subjects_presented_together_count

#Return a matrix len(subjects_count) x len(subjects_count)
def cooccurence_matrix(cooccurence_with_keys):
    cooc_matrix = []
    for y in cooccurence_with_keys:
        x_tmp = []
        for x in cooccurence_with_keys[y]:
            x_tmp.append(cooccurence_with_keys[y][x])
        cooc_matrix.append(x_tmp)
    return cooc_matrix

def subject_scoring(cooc_matrix):
    subject_scores = [ ]
    for subject in cooc_matrix:
        subject_scores.append(sum(subject))
    return subject_scores

if __name__ == '__main__':
    result = get_and_beautify_data_from_api(lookfor="vietnam", year="2015")
    if result['records'][0] != 0:
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
        print("No result!!!!!")