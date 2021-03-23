from ...generated.models import NewickTreeResponse


def get_comparative_newick_data(user, token_info, job_id):  # noqa: E501
    """get_comparative_newick_data

    Get newick tree file along with metadata for a given job id. # noqa: E501


    :rtype: NewickTreeResponse
    """
    return NewickTreeResponse(
        tree="(Bovine:1.69395,(Hylobates:0.36079,(Pongo:0.33636,(G._Gorilla:0.17147, (P._paniscus:0.19268,H._sapiens:0.11927):0.08386):0.06124):0.15057):0.54939, Rodent:1.21460);"
    )
