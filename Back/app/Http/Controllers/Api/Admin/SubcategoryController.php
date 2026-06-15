<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Http\Request;
use App\Models\Subcategory;
class SubcategoryController
{
    public function index()
    {
        $subcategories = Subcategory::all();
        return response()->json($subcategories);
    }
    public function show($id)
    {
        $subcategory = Subcategory::findOrFail($id);
        return response()->json($subcategory);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'service_id' => 'required|exists:services,id',
        ]);
    
        $subcategory = Subcategory::create($request->only(['name','service_id']));
        return response()->json($subcategory, 201);
    }
    
    public function update(Request $request, $id)
    {
        $subcategory = Subcategory::findOrFail($id);
    
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'service_id' => 'sometimes|exists:services,id',
        ]);
    
        $subcategory->update($request->only(['name','service_id']));
        return response()->json($subcategory);
    }
    public function destroy($id)
    {
        $subcategory = Subcategory::findOrFail($id);
        $subcategory->delete();
        return response()->json(null, 204);
    }
}
