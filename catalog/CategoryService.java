package com.shopstream.coreapi.catalog;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.Slugs;

@Service
public class CategoryService {

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<Category> list() {
        return categories.findAllByOrderByNameAsc();
    }

    @Transactional
    public Category create(CategoryRequest request) {
        String name = request.name().trim();
        String slug = Slugs.slugify(name, "category");
        if (categories.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Category already exists");
        }
        return categories.save(new Category(name, slug));
    }
}